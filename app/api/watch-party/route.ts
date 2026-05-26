import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { mediaType, tmdbId, season, episode } = await req.json()

    if (!mediaType || !tmdbId) {
      return NextResponse.json({ error: "mediaType et tmdbId requis" }, { status: 400 })
    }

    if (mediaType === "series" && (!season || !episode)) {
      return NextResponse.json({ error: "season et episode requis pour les séries" }, { status: 400 })
    }

    // Check if user already has an active watch party
    const existingParty = await prisma.watchParty.findFirst({
      where: { hostId: user.id },
      include: { participants: true },
    })

    if (existingParty) {
      return NextResponse.json({ error: "Vous avez déjà une watch party active" }, { status: 400 })
    }

    // Create new watch party
    const watchParty = await prisma.watchParty.create({
      data: {
        hostId: user.id,
        mediaType,
        tmdbId,
        season: season || null,
        episode: episode || null,
        currentTime: 0,
        isPlaying: false,
      },
    })

    // Add host as first participant
    await prisma.watchPartyParticipant.create({
      data: {
        watchPartyId: watchParty.id,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      },
    })

    return NextResponse.json({ watchParty }, { status: 201 })
  } catch (error) {
    console.error("Watch party creation error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const watchPartyId = searchParams.get("id")

    if (watchPartyId) {
      // Get specific watch party
      const watchParty = await prisma.watchParty.findUnique({
        where: { id: watchPartyId },
        include: {
          participants: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 50,
          },
        },
      })

      if (!watchParty) {
        return NextResponse.json({ error: "Watch party non trouvée" }, { status: 404 })
      }

      return NextResponse.json({ watchParty })
    } else {
      // Get user's active watch party
      const watchParty = await prisma.watchParty.findFirst({
        where: {
          participants: {
            some: { userId: user.id },
          },
        },
        include: {
          participants: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 50,
          },
        },
      })

      return NextResponse.json({ watchParty })
    }
  } catch (error) {
    console.error("Watch party fetch error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    // Check if user is the host
    const watchParty = await prisma.watchParty.findUnique({
      where: { id },
    })

    if (!watchParty) {
      return NextResponse.json({ error: "Watch party non trouvée" }, { status: 404 })
    }

    if (watchParty.hostId !== user.id) {
      return NextResponse.json({ error: "Seul l'hôte peut supprimer la watch party" }, { status: 403 })
    }

    await prisma.watchParty.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Watch party deletion error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
