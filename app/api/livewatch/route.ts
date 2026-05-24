import { NextRequest, NextResponse } from "next/server"
import { fetchLiveWatch, LIVEWATCH_CACHE_SECONDS, LIVEWATCH_ENDPOINTS } from "@/lib/livewatch"
import type { LiveWatchEmbedResponse } from "@/lib/livewatch-types"

export const revalidate = 3600
export const dynamic = "force-dynamic"

const CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${3600}, stale-while-revalidate=600`,
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    if (!type) {
      return NextResponse.json({ error: "Parametre type requis." }, { status: 400 })
    }

    const params: Record<string, string | undefined> = {}

    for (const key of ["country", "search", "limit", "sport"]) {
      const value = searchParams.get(key)
      if (value) params[key] = value
    }

    let endpoint: string

    switch (type) {
      case "sports":
        endpoint = LIVEWATCH_ENDPOINTS.sports
        break
      case "football":
        endpoint = LIVEWATCH_ENDPOINTS.football
        break
      case "bosstv":
        endpoint = LIVEWATCH_ENDPOINTS.bosstv
        break
      case "sportsInfo":
        endpoint = LIVEWATCH_ENDPOINTS.sportsInfo
        break
      default:
        return NextResponse.json({ error: "Type non reconnu." }, { status: 400 })
    }

    const data = await fetchLiveWatch<LiveWatchEmbedResponse>(endpoint, params)

    return NextResponse.json(data, { headers: CACHE_HEADERS })
  } catch (error) {
    console.error("LiveWatch proxy error:", error)
    return NextResponse.json({ error: "Impossible de charger LiveWatch." }, { status: 502 })
  }
}
