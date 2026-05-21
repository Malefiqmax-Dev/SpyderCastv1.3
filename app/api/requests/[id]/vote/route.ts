import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { mapRequestRecord, type RequestMediaType } from "@/lib/content-requests"
import { isContentInCatalog } from "@/lib/content-requests"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Connectez-vous pour voter." }, { status: 401 })
    }

    const { id } = await params

    const request = await prisma.contentRequest.findUnique({
      where: { id },
      select: { id: true, status: true, tmdbId: true, mediaType: true },
    })

    if (!request) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 })
    }

    if (request.status !== "pending") {
      return NextResponse.json({ error: "Les votes sont fermes pour cette demande." }, { status: 400 })
    }

    const existingVote = await prisma.contentRequestVote.findUnique({
      where: {
        requestId_userId: {
          requestId: id,
          userId: session.id,
        },
      },
    })

    if (existingVote) {
      await prisma.contentRequestVote.delete({ where: { id: existingVote.id } })
    } else {
      await prisma.contentRequestVote.create({
        data: {
          requestId: id,
          userId: session.id,
        },
      })
    }

    const refreshed = await prisma.contentRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            nameColor: true,
          },
        },
        _count: { select: { votes: true } },
      },
    })

    if (!refreshed) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 })
    }

    const hasVoted = !existingVote
    const inCatalog = await isContentInCatalog(
      refreshed.tmdbId,
      refreshed.mediaType as RequestMediaType,
    )

    return NextResponse.json({
      request: mapRequestRecord(refreshed, { hasVoted, inCatalog }),
      voted: hasVoted,
    })
  } catch (error) {
    console.error("Request vote error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
