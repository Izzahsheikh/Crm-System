import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCollections } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { leads } = await getCollections();
    const [totalLeads, leadsByStatus, leadsByPriority, agentPerformance, recentLeads, topLeads, overdueFollowups] = await Promise.all([
      leads.countDocuments(),
      leads.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
      leads.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]).toArray(),
      leads.aggregate([{ $match: { assignedTo: { $ne: null } } }, { $group: { _id: "$assignedTo", total: { $sum: 1 }, won: { $sum: { $cond: [{ $eq: ["$status", "CLOSED_WON"] }, 1, 0] } } } }, { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "agent" } }, { $unwind: "$agent" }, { $project: { agentName: "$agent.name", total: 1, won: 1 } }, { $sort: { total: -1 } }]).toArray(),
      leads.find().sort({ createdAt: -1 }).limit(5).toArray(),
      leads.find({ status: { $nin: ["CLOSED_WON", "CLOSED_LOST"] } }).sort({ score: -1 }).limit(5).toArray(),
      leads.countDocuments({ followUpDate: { $lt: new Date() }, status: { $nin: ["CLOSED_WON", "CLOSED_LOST"] } }),
    ]);
    const statusMap: Record<string, number> = {};
    leadsByStatus.forEach((s: any) => { statusMap[s._id] = s.count; });
    const priorityMap: Record<string, number> = {};
    leadsByPriority.forEach((p: any) => { priorityMap[p._id] = p.count; });
    return NextResponse.json({
      totalLeads,
      activeLeads: (statusMap["NEW"] || 0) + (statusMap["CONTACTED"] || 0) + (statusMap["QUALIFIED"] || 0) + (statusMap["VIEWING"] || 0) + (statusMap["NEGOTIATION"] || 0),
      hotLeads: priorityMap["high"] || 0,
      closedWon: statusMap["CLOSED_WON"] || 0,
      leadsByStatus: statusMap,
      leadsByPriority: priorityMap,
      agentPerformance,
      recentLeads,
      topLeads,
      overdueFollowups,
    });
  } catch (error) {
    console.error("GET /api/analytics:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
