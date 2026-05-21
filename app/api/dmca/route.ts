import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, workDescription, contentUrl, goodFaith, accuracy, signature } = body

    // Validate required fields
    if (!name || !email || !workDescription || !contentUrl || !signature) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 })
    }

    if (typeof goodFaith !== "boolean" || typeof accuracy !== "boolean") {
      return NextResponse.json({ error: "Les déclarations sont requises." }, { status: 400 })
    }

    // Create DMCA report
    const report = await prisma.dmcaReport.create({
      data: {
        name: String(name),
        email: String(email),
        workDescription: String(workDescription),
        contentUrl: String(contentUrl),
        goodFaith: Boolean(goodFaith),
        accuracy: Boolean(accuracy),
        signature: String(signature),
      },
    })

    return NextResponse.json({ success: true, id: report.id }, { status: 201 })
  } catch (error) {
    console.error("DMCA report submission error:", error)
    return NextResponse.json({ error: "Erreur lors de l'envoi du signalement." }, { status: 500 })
  }
}
