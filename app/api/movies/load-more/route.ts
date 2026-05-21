import { NextRequest, NextResponse } from "next/server"
import { getPopularMovies } from "@/lib/tmdb"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get("page") || "1"
  
  try {
    const data = await getPopularMovies(parseInt(page))
    return NextResponse.json({ movies: data.results })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}
