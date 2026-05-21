import { NextRequest, NextResponse } from "next/server"
import { signIn, COOKIE_NAME } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isOwnerEmail } from "@/lib/owner"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Champs manquants." }, { status: 400 })
    }
    const normalizedEmail = email.trim().toLowerCase()
    const result = await signIn(normalizedEmail, password)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    const res = NextResponse.json({
      success: true,
      user: result.user,
      isOwner: isOwnerEmail(normalizedEmail),
      liked: dbUser?.liked || [],
      watched: dbUser?.watched || [],
      watchLater: dbUser?.watchLater || [],
    })

    res.cookies.set(COOKIE_NAME, result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return res
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
