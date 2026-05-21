import { NextRequest, NextResponse } from "next/server"
import { getOwnerAdminOrResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "all"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const perPage = Math.min(50, Math.max(10, parseInt(searchParams.get("perPage") || "20", 10) || 20))

    const where = status && status !== "all" ? { status } : {}

    const [reports, total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.dmcaReport.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.dmcaReport.count({ where }),
      prisma.dmcaReport.count({ where: { status: "pending" } }),
      prisma.dmcaReport.count({ where: { status: "approved" } }),
      prisma.dmcaReport.count({ where: { status: "rejected" } }),
    ])

    return NextResponse.json({
      reports,
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
    console.error("Admin DMCA GET error:", error)
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

    const note = typeof adminNote === "string" ? adminNote.trim().slice(0, 500) : undefined

    const updated = await prisma.dmcaReport.update({
      where: { id },
      data: {
        status,
        adminNote: note ?? null,
        reviewedAt: status === "pending" ? null : new Date(),
      },
    })

    return NextResponse.json({ report: updated })
  } catch (error) {
    console.error("Admin DMCA PATCH error:", error)
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

    await prisma.dmcaReport.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin DMCA DELETE error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
