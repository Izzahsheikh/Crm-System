import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCollections } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, { params }: { params: { leadId: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leads, activitylogs } = await getCollections();

    const lead = await leads.findOne({ _id: new ObjectId(params.leadId) });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (user.role === "AGENT" && lead.assignedTo?.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const activity = await activitylogs.aggregate([
      { $match: { leadId: new ObjectId(params.leadId) } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $addFields: { user: { $arrayElemAt: ["$user", 0] } } },
      { $project: { "user.passwordHash": 0 } },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("GET /api/activity/[leadId]:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}