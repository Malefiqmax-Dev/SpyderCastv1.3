import { NextRequest, NextResponse } from "next/server"
import { getOwnerAdminOrResponse } from "@/lib/admin-auth"
import {
  isContentInCatalog,
  mapRequestRecord,
  type RequestMediaType,
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

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") as RequestStatus | "all" | null
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const perPage = Math.min(50, Math.max(10, parseInt(searchParams.get("perPage") || "20", 10) || 20))

    const where =
      status && status !== "all"
        ? { status }
        : {}

    const [records, total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.contentRequest.findMany({
        where,
        include: requestInclude,
        orderBy: [{ votes: { _count: "desc" } }, { createdAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.contentRequest.count({ where }),
      prisma.contentRequest.count({ where: { status: "pending" } }),
      prisma.contentRequest.count({ where: { status: "approved" } }),
      prisma.contentRequest.count({ where: { status: "rejected" } }),
    ])

    const catalogChecks = await Promise.all(
      records.map((record) => isContentInCatalog(record.tmdbId, record.mediaType as RequestMediaType)),
    )

    return NextResponse.json({
      requests: records.map((record, index) =>
        mapRequestRecord(record, { inCatalog: catalogChecks[index] }),
      ),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    })
  } catch (error) {
    console.error("Admin requests GET error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { id, status, adminNote } = await req.json()

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID requis." }, { status: 400 })
    }

    if (status !== "approved" && status !== "rejected" && status !== "pending") {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 })
    }

    const note =
      typeof adminNote === "string" ? adminNote.trim().slice(0, 500) : undefined

    const updated = await prisma.contentRequest.update({
      where: { id },
      data: {
        status,
        adminNote: note ?? null,
        reviewedAt: status === "pending" ? null : new Date(),
      },
      include: requestInclude,
    })

    const inCatalog = await isContentInCatalog(
      updated.tmdbId,
      updated.mediaType as RequestMediaType,
    )

    return NextResponse.json({
      request: mapRequestRecord(updated, { inCatalog }),
    })
  } catch (error) {
    console.error("Admin requests PATCH error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { id } = await req.json()
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID requis." }, { status: 400 })
    }

    await prisma.contentRequest.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin requests DELETE error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
