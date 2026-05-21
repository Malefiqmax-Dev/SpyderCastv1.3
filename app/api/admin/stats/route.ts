import { NextResponse } from "next/server"
import { getOwnerAdminOrResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
    const auth = await getOwnerAdminOrResponse(ip)
    if ("response" in auth) return auth.response

    const now = Date.now()
    const fiveMinAgo = new Date(now - 5 * 60 * 1000)
    const oneHourAgo = new Date(now - 60 * 60 * 1000)
    const twentyFourHAgo = new Date(now - 24 * 60 * 60 * 1000)

    const [totalUsers, onlineNow, lastHour, last24h, totalMovies, totalSeries, totalHls, totalViews, topMovies] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastSeen: { gte: fiveMinAgo } } }),
      prisma.user.count({ where: { lastSeen: { gte: oneHourAgo } } }),
      prisma.user.count({ where: { lastSeen: { gte: twentyFourHAgo } } }),
      prisma.movie.count(),
      prisma.series.count(),
      prisma.hLSMovie.count(),
      prisma.movieView.count(),
      prisma.movieView.groupBy({
        by: ["tmdbId", "movieId", "movieType"],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 10,
      }),
    ])

    let tmdbOk = false
    let tmdbMs = 0
    const tmdbToken = process.env.TMDB_API_TOKEN
    if (tmdbToken) {
      try {
        const started = Date.now()
        const response = await fetch("https://api.themoviedb.org/3/configuration", {
          headers: { Authorization: `Bearer ${tmdbToken}` },
          next: { revalidate: 300 },
        })
        tmdbMs = Date.now() - started
        tmdbOk = response.ok
      } catch {
        tmdbOk = false
      }
    }

    return NextResponse.json(
      {
        totalUsers,
        onlineNow,
        lastHour,
        last24h,
        totalMovies,
        totalSeries,
        totalHls,
        totalViews,
        topMovies,
        tmdb: { ok: tmdbOk, ms: tmdbMs },
        database: { ok: true },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30",
        },
      }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
