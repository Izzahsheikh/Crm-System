import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCollections } from "@/lib/mongodb";
import { calculateLeadScore } from "@/lib/scoring";
import { sendNewLeadEmail } from "@/lib/email";
import { ObjectId } from "mongodb";
import type { LeadSource, LeadStatus } from "@/lib/types";

// GET /api/leads — fetch all leads
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leads } = await getCollections();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query: any = {};

    if (user.role === "AGENT") query.assignedTo = new ObjectId(user.id);

    if (status && status !== "all") {
      if (status === "hot") query.priority = "high";
      else query.status = status.toUpperCase();
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { propertyInterest: { $regex: search, $options: "i" } },
      ];
    }

    const result = await leads.aggregate([
      { $match: query },
      { $lookup: { from: "users", localField: "assignedTo", foreignField: "_id", as: "assignedToUser" } },
      { $addFields: { assignedTo: { $arrayElemAt: ["$assignedToUser", 0] } } },
      { $unset: "assignedToUser" },
      { $sort: { score: -1, createdAt: -1 } },
    ]).toArray();

    return NextResponse.json({ leads: result });
  } catch (error) {
    console.error("GET /api/leads:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/leads — create new lead
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leads, activitylogs } = await getCollections();
    const body = await req.json();

    if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!body.phone?.trim()) return NextResponse.json({ error: "Phone is required" }, { status: 400 });

    const budget = Number(body.budget) || Math.round((Number(body.budgetMin) + Number(body.budgetMax)) / 2) || 0;
    const { score, priority } = calculateLeadScore(budget);

    const lead = {
      name: body.name.trim(),
      email: body.email?.trim() || "",
      phone: body.phone.trim(),
      propertyInterest: (body.propertyType || body.propertyInterest || "") as string,
      location: (body.location || "") as string,
      budget,
      budgetMin: Number(body.budgetMin) || 0,
      budgetMax: Number(body.budgetMax) || 0,
      source: (body.source || "WEBSITE") as LeadSource,
      status: "NEW" as LeadStatus,
      notes: body.notes?.trim() || "",
      score,
      priority,
      assignedTo: body.assignedTo ? new ObjectId(body.assignedTo) : null,
      followUpDate: null as Date | null,
      lastActivityAt: new Date(),
      createdAt: new Date(),
    };

    const result = await leads.insertOne(lead);

    await activitylogs.insertOne({
      leadId: result.insertedId,
      userId: new ObjectId(user.id),
      action: "created",
      oldValue: "",
      newValue: "",
      message: `Lead created by ${user.name}`,
      createdAt: new Date(),
    });

    sendNewLeadEmail({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      propertyInterest: lead.propertyInterest,
      budget: lead.budget,
      source: lead.source,
      priority: lead.priority,
    }).catch(console.error);

    return NextResponse.json({ lead: { ...lead, _id: result.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}