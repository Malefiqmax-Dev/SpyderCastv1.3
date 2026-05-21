import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuth } from "@/components/auth/auth-context"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuth()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { watchPartyId, content } = await req.json()

    if (!watchPartyId || !content) {
      return NextResponse.json({ error: "watchPartyId et content requis" }, { status: 400 })
    }

    // Check if user is a participant
    const participant = await prisma.watchPartyParticipant.findUnique({
      where: {
        watchPartyId_userId: {
          watchPartyId,
          userId: user.id,
        },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: "Vous n'êtes pas dans cette watch party" }, { status: 403 })
    }

    // Create message
    const message = await prisma.watchPartyMessage.create({
      data: {
        watchPartyId,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        content: content.trim().slice(0, 500),
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("Watch party chat error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user } = await getAuth()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const watchPartyId = searchParams.get("id")
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10))
    const before = searchParams.get("before")

    if (!watchPartyId) {
      return NextResponse.json({ error: "watchPartyId requis" }, { status: 400 })
    }

    // Check if user is a participant
    const participant = await prisma.watchPartyParticipant.findUnique({
      where: {
        watchPartyId_userId: {
          watchPartyId,
          userId: user.id,
        },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: "Vous n'êtes pas dans cette watch party" }, { status: 403 })
    }

    // Get messages
    const where: any = { watchPartyId }
    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.watchPartyMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    console.error("Watch party chat fetch error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
