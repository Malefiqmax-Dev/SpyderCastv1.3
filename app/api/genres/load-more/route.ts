import { NextRequest, NextResponse } from "next/server"
import { discoverByGenre } from "@/lib/tmdb"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const genreIdStr = searchParams.get("id")
  const pageStr = searchParams.get("page") || "1"
  
  if (!genreIdStr) return NextResponse.json({ error: "Missing ID" }, { status: 400 })
  
  const genreId = parseInt(genreIdStr)
  const page = parseInt(pageStr)
  
  try {
    const [moviesRes, tvRes] = await Promise.all([
      discoverByGenre("movie", genreId, page).catch(() => ({ results: [] })),
      discoverByGenre("tv", genreId, page).catch(() => ({ results: [] })),
    ])
    
    const results = [
      ...(moviesRes.results || []).map((m: any) => ({ ...m, media_type: "movie" })),
      ...(tvRes.results || []).map((m: any) => ({ ...m, media_type: "tv" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
