import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { formatProfileUser } from "@/lib/profile-icons"
import { isOwnerEmail } from "@/lib/owner"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ user: null, isOwner: false })

    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
    })
    if (!dbUser) return NextResponse.json({ user: null, isOwner: false })

    const owner = isOwnerEmail(dbUser.email)

    return NextResponse.json({
      user: formatProfileUser(dbUser, owner),
      isOwner: owner,
      liked: dbUser.liked || [],
      watched: dbUser.watched || [],
      watchLater: dbUser.watchLater || [],
      stats: {
        liked: Array.isArray(dbUser.liked) ? dbUser.liked.length : 0,
        watched: Array.isArray(dbUser.watched) ? dbUser.watched.length : 0,
        watchLater: Array.isArray(dbUser.watchLater) ? dbUser.watchLater.length : 0,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ user: null, isOwner: false })
  }
}
