import { NextRequest, NextResponse } from "next/server"
import { signUp } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Champs manquants." }, { status: 400 })
    }
    const result = await signUp(username.trim(), email.trim().toLowerCase(), password)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
