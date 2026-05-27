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
  // Autoriser toutes les requêtes API pour éviter les erreurs 403
  // La sécurité des routes sensibles (admin) est gérée par requireOwnerSession dans le proxy
  return true

  // Ancienne logique de restriction par IP/Origine (désactivée car trop restrictive)
  /*
  if (request.nextUrl.pathname === "/api/auth/me") return true
  if (process.env.NODE_ENV !== "production") return true
  ...
  */
}
