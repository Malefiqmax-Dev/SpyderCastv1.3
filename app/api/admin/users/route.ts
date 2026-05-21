import { NextRequest, NextResponse } from "next/server"
import { getOwnerAdminOrResponse } from "@/lib/admin-auth"
import { isOwnerEmail } from "@/lib/owner"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const ALLOWED_ROLES = new Set(["member", "user"])

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const perPage = Math.min(50, Math.max(10, parseInt(searchParams.get("perPage") || "20", 10) || 20))
    const search = (searchParams.get("search") || "").trim().slice(0, 100)

    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { username: { contains: search } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          nameColor: true,
          createdAt: true,
          lastSeen: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        nameColor: user.nameColor,
        createdAt: user.createdAt,
        lastSeen: user.lastSeen,
        isOwner: isOwnerEmail(user.email),
      })),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { id, role } = await req.json()
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Utilisateur invalide." }, { status: 400 })
    }

    if (role === "admin") {
      return NextResponse.json({ error: "Promotion admin interdite." }, { status: 403 })
    }

    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: "Role invalide." }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    })

    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 })
    }

    if (isOwnerEmail(target.email)) {
      return NextResponse.json({ error: "Action interdite sur le proprietaire." }, { status: 403 })
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const body = await req.json().catch(() => null)
    const queryId = new URL(req.url).searchParams.get("id")
    const id = body?.id ?? queryId

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Utilisateur invalide." }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    })

    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 })
    }

    if (isOwnerEmail(target.email)) {
      return NextResponse.json({ error: "Suppression du proprietaire interdite." }, { status: 403 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
