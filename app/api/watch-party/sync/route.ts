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

    const { watchPartyId, currentTime, isPlaying, action } = await req.json()

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

    // Update watch party state
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (currentTime !== undefined) {
      updateData.currentTime = currentTime
    }

    if (isPlaying !== undefined) {
      updateData.isPlaying = isPlaying
    }

    const watchParty = await prisma.watchParty.update({
      where: { id: watchPartyId },
      data: updateData,
    })

    // Update participant's last sync time
    await prisma.watchPartyParticipant.update({
      where: { id: participant.id },
      data: { lastSync: new Date() },
    })

    return NextResponse.json({ watchParty })
  } catch (error) {
    console.error("Watch party sync error:", error)
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

    // Get current watch party state
    const watchParty = await prisma.watchParty.findUnique({
      where: { id: watchPartyId },
    })

    if (!watchParty) {
      return NextResponse.json({ error: "Watch party non trouvée" }, { status: 404 })
    }

    return NextResponse.json({
      currentTime: watchParty.currentTime,
      isPlaying: watchParty.isPlaying,
      updatedAt: watchParty.updatedAt,
    })
  } catch (error) {
    console.error("Watch party sync fetch error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
