import type { NextRequest } from "next/server"

function parseAllowedIps(): Set<string> {
  const ips = new Set<string>()
  const raw = process.env.ALLOWED_API_IPS ?? process.env.ALLOWED_API_IP ?? "80.96.58.137"

  for (const ip of raw.split(",")) {
    const trimmed = ip.trim()
    if (trimmed) ips.add(trimmed)
  }

  return ips
}

export function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null
  )
}

function collectAllowedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>()
  origins.add(request.nextUrl.origin)

  const siteUrl = process.env.SITE_URL?.trim()
  if (siteUrl) {
    try {
      origins.add(new URL(siteUrl).origin)
    } catch {
      // ignore invalid SITE_URL
    }
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000")
    origins.add("http://127.0.0.1:3000")
  }

  return origins
}

function hasAllowedOrigin(request: NextRequest, allowed: Set<string>): boolean {
  const origin = request.headers.get("origin")
  if (origin && allowed.has(origin)) return true

  const referer = request.headers.get("referer")
  if (!referer) return false

  try {
    return allowed.has(new URL(referer).origin)
  } catch {
    return false
  }
}

export function isAllowedApiRequest(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true

  const ip = getClientIp(request)
  if (ip && parseAllowedIps().has(ip)) return true

  const allowed = collectAllowedOrigins(request)
  if (hasAllowedOrigin(request, allowed)) return true

  const secFetchSite = request.headers.get("sec-fetch-site")
  if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
    return hasAllowedOrigin(request, allowed)
  }

  return false
}
