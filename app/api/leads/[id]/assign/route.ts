import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCollections } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { leads, users, activitylogs } = await getCollections();
    const { agentId } = await req.json();

    if (!agentId) return NextResponse.json({ error: "agentId is required" }, { status: 400 });

    const lead = await leads.findOne({ _id: new ObjectId(params.id) });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const agent = await users.findOne({ _id: new ObjectId(agentId) });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const isReassign = !!lead.assignedTo;

    await leads.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { assignedTo: new ObjectId(agentId), lastActivityAt: new Date() } }
    );

    await activitylogs.insertOne({
      leadId: new ObjectId(params.id),
      userId: new ObjectId(user.id),
      action: isReassign ? "reassigned" : "assigned",
      oldValue: lead.assignedTo?.toString() || "unassigned",
      newValue: agentId,
      message: `Lead ${isReassign ? "reassigned" : "assigned"} to ${agent.name} by ${user.name}`,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, assignedTo: agent.name });
  } catch (error) {
    console.error("POST /api/leads/[id]/assign:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
