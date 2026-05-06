import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCollections } from "@/lib/mongodb";
import { canManageUsers } from "@/lib/permissions";
import { ObjectId } from "mongodb";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageUsers(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { users } = await getCollections();
    const body = await req.json();

    const existing = await users.findOne({ _id: new ObjectId(params.id) });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updates: any = { updatedAt: new Date() };
    if (body.name) updates.name = body.name;
    if (body.role && ["ADMIN", "MANAGER", "AGENT"].includes(body.role)) updates.role = body.role;
    if (typeof body.active === "boolean") updates.active = body.active;

    await users.updateOne({ _id: new ObjectId(params.id) }, { $set: updates });

    const updated = await users.findOne(
      { _id: new ObjectId(params.id) },
      { projection: { passwordHash: 0 } }
    );

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("PATCH /api/users/[id]:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageUsers(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.id === params.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const { users } = await getCollections();
    const existing = await users.findOne({ _id: new ObjectId(params.id) });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await users.deleteOne({ _id: new ObjectId(params.id) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/users/[id]:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}