import { NextRequest, NextResponse } from "next/server"
import { getPopularMovies } from "@/lib/tmdb"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const data = await getPopularMovies(page)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
