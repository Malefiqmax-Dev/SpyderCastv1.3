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

    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
    })

    // Mask the keys for security
    const maskedKeys = apiKeys.map((key) => ({
      ...key,
      key: `${key.key.substring(0, 8)}${"*".repeat(Math.max(0, key.key.length - 8))}`,
    }))

    return NextResponse.json({ apiKeys: maskedKeys })
  } catch (error) {
    console.error("Admin API keys GET error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { name, permissions, expiresAt } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Nom requis." }, { status: 400 })
    }

    // Generate a random API key
    const key = `sk_${Buffer.from(Date.now().toString() + Math.random().toString()).toString("base64").substring(0, 32)}`

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        permissions: permissions || "read",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json({ apiKey }, { status: 201 })
  } catch (error) {
    console.error("Admin API keys POST error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { id, isActive, permissions } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 })
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(permissions && { permissions }),
      },
    })

    return NextResponse.json({ apiKey: updated })
  } catch (error) {
    console.error("Admin API keys PATCH error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 })
    }

    await prisma.apiKey.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin API keys DELETE error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
