import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Non authentifie." }, { status: 401 })

    const { action, item } = await req.json()
    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 })

    function toggle(list: any[], item: any) {
      const exists = list.some((i) => i.id === item.id && i.type === item.type)
      return exists ? list.filter((i) => !(i.id === item.id && i.type === item.type)) : [...list, item]
    }

    let updates: any = {}

    if (action === "toggleLike") {
      updates.liked = toggle((user.liked as any[]) || [], item)
    } else if (action === "toggleWatched") {
      updates.watched = toggle((user.watched as any[]) || [], item)
    } else if (action === "toggleWatchLater") {
      updates.watchLater = toggle((user.watchLater as any[]) || [], item)
    } else {
      return NextResponse.json({ error: "Action invalide." }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.id },
      data: updates
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
