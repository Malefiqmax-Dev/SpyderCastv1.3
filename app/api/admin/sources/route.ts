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
    const movieId = searchParams.get("movieId")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const perPage = Math.min(50, Math.max(10, parseInt(searchParams.get("perPage") || "20", 10) || 20))

    let where: any = {}
    if (movieId) {
      where.movieId = movieId
    }

    const [sources, total] = await Promise.all([
      prisma.movieSource.findMany({
        where,
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              tmdbId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.movieSource.count({ where }),
    ])

    return NextResponse.json({
      sources,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    console.error("Admin sources GET error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { movieId, url, quality, language, size, sizeBytes } = await req.json()

    if (!movieId || !url) {
      return NextResponse.json({ error: "movieId et url requis." }, { status: 400 })
    }

    const source = await prisma.movieSource.create({
      data: {
        movieId,
        url,
        quality: quality || null,
        language: language || null,
        size: size || null,
        sizeBytes: sizeBytes ? BigInt(sizeBytes) : null,
      },
    })

    return NextResponse.json({ source }, { status: 201 })
  } catch (error) {
    console.error("Admin sources POST error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getOwnerAdminOrResponse(getClientIp(req))
    if ("response" in auth) return auth.response

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 })
    }

    await prisma.movieSource.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin sources DELETE error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
