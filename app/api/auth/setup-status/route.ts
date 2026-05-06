import { NextResponse } from "next/server"
import { getCollections } from "@/lib/mongodb"

export async function GET() {
  try {
    const { users } = await getCollections()
    const adminCount = await users.countDocuments({ role: "ADMIN" })
    return NextResponse.json({ initialized: adminCount > 0 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error"
    return NextResponse.json({ error: message, initialized: false }, { status: 500 })
  }
}
