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

    const { watchPartyId } = await req.json()

    if (!watchPartyId) {
      return NextResponse.json({ error: "watchPartyId requis" }, { status: 400 })
    }

    // Check if watch party exists
    const watchParty = await prisma.watchParty.findUnique({
      where: { id: watchPartyId },
    })

    if (!watchParty) {
      return NextResponse.json({ error: "Watch party non trouvée" }, { status: 404 })
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.watchPartyParticipant.findUnique({
      where: {
        watchPartyId_userId: {
          watchPartyId,
          userId: user.id,
        },
      },
    })

    if (existingParticipant) {
      return NextResponse.json({ error: "Vous êtes déjà dans cette watch party" }, { status: 400 })
    }

    // Add user as participant
    const participant = await prisma.watchPartyParticipant.create({
      data: {
        watchPartyId,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      },
    })

    return NextResponse.json({ participant }, { status: 201 })
  } catch (error) {
    console.error("Watch party join error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await getAuth()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { watchPartyId } = await req.json()

    if (!watchPartyId) {
      return NextResponse.json({ error: "watchPartyId requis" }, { status: 400 })
    }

    // Remove user from watch party
    await prisma.watchPartyParticipant.delete({
      where: {
        watchPartyId_userId: {
          watchPartyId,
          userId: user.id,
        },
      },
    })

    // If user was the host, transfer host to next participant or delete party
    const watchParty = await prisma.watchParty.findUnique({
      where: { id: watchPartyId },
      include: { participants: true },
    })

    if (watchParty && watchParty.hostId === user.id) {
      if (watchParty.participants.length > 0) {
        // Transfer host to next participant
        await prisma.watchParty.update({
          where: { id: watchPartyId },
          data: { hostId: watchParty.participants[0].userId },
        })
      } else {
        // Delete party if no participants left
        await prisma.watchParty.delete({
          where: { id: watchPartyId },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Watch party leave error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
