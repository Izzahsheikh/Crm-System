import { NextResponse } from "next/server"
import { getCollections } from "@/lib/mongodb"
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth"
import type { UserDoc } from "@/lib/types"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const { users } = await getCollections()
    const user = (await users.findOne({ email: email.toLowerCase() })) as UserDoc | null
    if (!user || !user.active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await signSession({
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    })
    await setSessionCookie(token)

    return NextResponse.json({
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("[v0] login error", err)
    const message = err instanceof Error ? err.message : "Login failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
