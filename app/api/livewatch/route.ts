import { NextRequest, NextResponse } from "next/server"
import { fetchLiveWatch, LIVEWATCH_CACHE_SECONDS } from "@/lib/livewatch"
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

    const params: Record<string, string | undefined> = { type }

    for (const key of ["country", "search", "limit", "sport"]) {
      const value = searchParams.get(key)
      if (value) params[key] = value
    }

    const data = await fetchLiveWatch<LiveWatchEmbedResponse>("/api/embed", params)

    return NextResponse.json(data, { headers: CACHE_HEADERS })
  } catch (error) {
    console.error("LiveWatch proxy error:", error)
    return NextResponse.json({ error: "Impossible de charger LiveWatch." }, { status: 502 })
  }
}
