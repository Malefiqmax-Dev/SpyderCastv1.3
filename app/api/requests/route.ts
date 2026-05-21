import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import {
  isContentInCatalog,
  mapRequestRecord,
  type RequestMediaType,
  type RequestSort,
  type RequestStatus,
} from "@/lib/content-requests"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const requestInclude = {
  user: {
    select: {
      id: true,
      username: true,
      avatar: true,
      nameColor: true,
    },
  },
  _count: {
    select: { votes: true },
  },
} as const

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    const { searchParams } = new URL(req.url)
    const sort = (searchParams.get("sort") || "votes") as RequestSort
    const status = searchParams.get("status") as RequestStatus | "all" | null
    const mine = searchParams.get("mine") === "1"
    const voted = searchParams.get("voted") === "1"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const perPage = Math.min(30, Math.max(10, parseInt(searchParams.get("perPage") || "12", 10) || 12))

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    } else if (!mine && !voted) {
      where.status = { in: ["pending", "approved"] }
    }

    if (mine) {
      if (!session) {
        return NextResponse.json({ error: "Connexion requise." }, { status: 401 })
      }
      where.userId = session.id
    }

    if (voted) {
      if (!session) {
        return NextResponse.json({ error: "Connexion requise." }, { status: 401 })
      }
      where.votes = { some: { userId: session.id } }
    }

    const orderBy =
      sort === "recent"
        ? [{ createdAt: "desc" as const }]
        : [{ votes: { _count: "desc" as const } }, { createdAt: "desc" as const }]

    const [records, total, pendingCount] = await Promise.all([
      prisma.contentRequest.findMany({
        where,
        include: requestInclude,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.contentRequest.count({ where }),
      prisma.contentRequest.count({ where: { status: "pending" } }),
    ])

    const userVotes = session
      ? new Set(
          (
            await prisma.contentRequestVote.findMany({
              where: {
                userId: session.id,
                requestId: { in: records.map((record) => record.id) },
              },
              select: { requestId: true },
            })
          ).map((vote) => vote.requestId),
        )
      : new Set<string>()

    const catalogChecks = await Promise.all(
      records.map((record) => isContentInCatalog(record.tmdbId, record.mediaType as RequestMediaType)),
    )

    return NextResponse.json({
      requests: records.map((record, index) =>
        mapRequestRecord(record, {
          hasVoted: userVotes.has(record.id),
          inCatalog: catalogChecks[index],
        }),
      ),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      pendingCount,
    })
  } catch (error) {
    console.error("Requests GET error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Connectez-vous pour faire une demande." }, { status: 401 })
    }

    const body = await req.json()
    const tmdbId = parseInt(String(body.tmdbId), 10)
    const mediaType = body.mediaType as RequestMediaType
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const posterPath = typeof body.posterPath === "string" ? body.posterPath : null
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : null

    if (!tmdbId || !title || (mediaType !== "movie" && mediaType !== "tv")) {
      return NextResponse.json({ error: "Donnees invalides." }, { status: 400 })
    }

    if (await isContentInCatalog(tmdbId, mediaType)) {
      return NextResponse.json({ error: "Ce contenu est deja disponible sur SpyderCast." }, { status: 409 })
    }

    const existing = await prisma.contentRequest.findUnique({
      where: { tmdbId_mediaType: { tmdbId, mediaType } },
      include: requestInclude,
    })

    if (existing?.status === "pending") {
      return NextResponse.json({ error: "Cette demande existe deja et est en attente." }, { status: 409 })
    }

    if (existing?.status === "approved") {
      return NextResponse.json({ error: "Cette demande a deja ete acceptee." }, { status: 409 })
    }

    let record

    if (existing?.status === "rejected") {
      record = await prisma.contentRequest.update({
        where: { id: existing.id },
        data: {
          title,
          posterPath,
          message,
          status: "pending",
          adminNote: null,
          reviewedAt: null,
          userId: session.id,
        },
        include: requestInclude,
      })
    } else {
      record = await prisma.contentRequest.create({
        data: {
          tmdbId,
          mediaType,
          title,
          posterPath,
          message,
          userId: session.id,
        },
        include: requestInclude,
      })

      await prisma.contentRequestVote.create({
        data: {
          requestId: record.id,
          userId: session.id,
        },
      })
    }

    const refreshed = await prisma.contentRequest.findUnique({
      where: { id: record.id },
      include: requestInclude,
    })

    if (!refreshed) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 })
    }

    return NextResponse.json({
      request: mapRequestRecord(refreshed, { hasVoted: true, inCatalog: false }),
    })
  } catch (error) {
    console.error("Requests POST error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
