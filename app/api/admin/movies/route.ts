import { NextRequest, NextResponse } from "next/server"
import { getOwnerAdminOrResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "all" // "movie", "series", "hls", or "all"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const perPage = Math.min(50, Math.max(10, parseInt(searchParams.get("perPage") || "20", 10) || 20))
    const search = searchParams.get("search") || ""

    let where: any = {}
    if (search) {
      where.title = { contains: search }
    }

    let data: any = { movies: [], series: [], hls: [], total: 0, totalPages: 0 }

    if (type === "all" || type === "movie") {
      const movies = await prisma.movie.findMany({
        where,
        include: {
          sources: true,
          _count: {
            select: { sources: true },
          },
        },
        orderBy: { addedAt: "desc" },
        skip: type === "movie" ? (page - 1) * perPage : 0,
        take: type === "movie" ? perPage : 100,
      })
      data.movies = movies
    }

    if (type === "all" || type === "series") {
      const series = await prisma.series.findMany({
        where,
        include: {
          episodes: true,
          _count: {
            select: { episodes: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: type === "series" ? (page - 1) * perPage : 0,
        take: type === "series" ? perPage : 100,
      })
      data.series = series
    }

    if (type === "all" || type === "hls") {
      const hls = await prisma.hLSMovie.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: type === "hls" ? (page - 1) * perPage : 0,
        take: type === "hls" ? perPage : 100,
      })
      data.hls = hls
    }

    if (type !== "all") {
      const count = type === "movie" 
        ? await prisma.movie.count({ where })
        : type === "series"
        ? await prisma.series.count({ where })
        : await prisma.hLSMovie.count({ where })
      
      data.total = count
      data.totalPages = Math.ceil(count / perPage)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin movies GET error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { id, type } = await req.json()

    if (!id || !type) {
      return NextResponse.json({ error: "ID et type requis." }, { status: 400 })
    }

    if (type === "movie") {
      await prisma.movie.delete({ where: { id } })
    } else if (type === "series") {
      await prisma.series.delete({ where: { id } })
    } else if (type === "hls") {
      await prisma.hLSMovie.delete({ where: { id } })
    } else {
      return NextResponse.json({ error: "Type invalide." }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin movies DELETE error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
