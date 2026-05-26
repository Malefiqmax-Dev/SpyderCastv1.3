import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { formatCommentUserSnapshot, resolveStoredCommentUser } from "@/lib/profile-icons"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const movieId = searchParams.get("movieId")

  if (!movieId) return NextResponse.json({ error: "Movie ID is required" }, { status: 400 })

  const comments = await prisma.comment.findMany({
    where: { movieId },
    orderBy: { createdAt: 'desc' }
  })

  const formatted = comments.map((comment) => ({
    ...comment,
    user: resolveStoredCommentUser(comment.user as Record<string, unknown>),
  }))

  return NextResponse.json(formatted)
}

export async function POST(req: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { movieId, content } = await req.json()

    if (!movieId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const snapshot = formatCommentUserSnapshot(user)

    const newComment = await prisma.comment.create({
      data: {
        movieId,
        content,
        user: snapshot,
      }
    })

    return NextResponse.json({
      ...newComment,
      user: snapshot,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
