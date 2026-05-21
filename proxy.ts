import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { isAllowedApiRequest } from "@/lib/api-guard"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production")
  }
  return new TextEncoder().encode(secret || "spydercast_super_secret_jwt_key_2024")
}

function apiForbidden() {
  return NextResponse.json({ error: "Acces refuse." }, { status: 403 })
}

function adminForbidden(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return apiForbidden()
  }
  return NextResponse.redirect(new URL("/", request.url))
}

async function requireOwnerSession(request: NextRequest) {
  const ownerEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!ownerEmail) return false

  const token = request.cookies.get("sc_token")?.value
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : ""
    return email === ownerEmail
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    if (!isAllowedApiRequest(request)) {
      return apiForbidden()
    }
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isOwner = await requireOwnerSession(request)
    if (!isOwner) {
      return adminForbidden(request)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*", "/admin", "/admin/:path*"],
}
