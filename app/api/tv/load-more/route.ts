import { NextRequest, NextResponse } from "next/server"
import { getPopularTV } from "@/lib/tmdb"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get("page") || "1"
  
  try {
    const data = await getPopularTV(parseInt(page))
    return NextResponse.json({ series: data.results })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
  }
}
