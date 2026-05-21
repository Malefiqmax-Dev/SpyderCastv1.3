import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isOwnerEmail } from "@/lib/owner"

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 120
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(userId: string, ip: string | null) {
  return `${userId}:${ip ?? "unknown"}`
}

export function checkAdminRateLimit(userId: string, ip: string | null): boolean {
  const key = getRateLimitKey(userId, ip)
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) return false

  entry.count += 1
  return true
}

export function adminForbiddenResponse() {
  return NextResponse.json({ error: "Acces refuse." }, { status: 403 })
}

export function adminRateLimitResponse() {
  return NextResponse.json({ error: "Trop de requetes. Reessayez dans un instant." }, { status: 429 })
}

export async function requireOwnerAdmin(ip?: string | null) {
  const session = await getSession()
  if (!session) return null

  if (!checkAdminRateLimit(session.id, ip ?? null)) {
    return { rateLimited: true as const }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatar: true,
      nameColor: true,
      createdAt: true,
      lastSeen: true,
    },
  })

  if (!user || !isOwnerEmail(user.email)) return null

  if (user.role !== "admin") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    })
    user.role = "admin"
  }

  return user
}

export async function getOwnerAdminOrResponse(ip?: string | null) {
  const result = await requireOwnerAdmin(ip)

  if (result && "rateLimited" in result) {
    return { response: adminRateLimitResponse() }
  }

  if (!result) {
    return { response: adminForbiddenResponse() }
  }

  return { admin: result }
}
