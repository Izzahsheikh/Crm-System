import { NextResponse } from "next/server"
import { getCollections } from "@/lib/mongodb"
import { hashPassword, setSessionCookie, signSession } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const { users } = await getCollections()
    const existingAdmin = await users.countDocuments({ role: "ADMIN" })
    if (existingAdmin > 0) {
      return NextResponse.json({ error: "Setup already complete" }, { status: 403 })
    }

    const passwordHash = await hashPassword(password)
    const now = new Date()
    const result = await users.insertOne({
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: "ADMIN",
      active: true,
      createdAt: now,
      updatedAt: now,
    })

    const token = await signSession({
      id: result.insertedId.toString(),
      email: email.toLowerCase(),
      name,
      role: "ADMIN",
    })
    await setSessionCookie(token)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] setup error", err)
    const message = err instanceof Error ? err.message : "Setup failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
