import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { formatProfileUser } from "@/lib/profile-icons"
import { validateProfileUpdates } from "@/lib/profile-validation"
import { isOwnerEmail } from "@/lib/owner"
import { prisma } from "@/lib/db"

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Non authentifie." }, { status: 401 })

    const body = await req.json()
    const { error, data } = validateProfileUpdates({
      username: body.username,
      avatarIconId: body.avatarIconId ?? body.avatar,
      nameColor: body.nameColor,
    })

    if (error) return NextResponse.json({ error }, { status: 400 })

    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: session.id },
        },
        select: { id: true },
      })

      if (existing) {
        return NextResponse.json({ error: "Ce pseudo est deja pris." }, { status: 409 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data,
    })

    const user = formatProfileUser(updated, isOwnerEmail(updated.email))

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
