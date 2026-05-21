import { NextRequest, NextResponse } from "next/server"
import {
  buildCalendarMonth,
  fetchCalendarItemsForRange,
  getMonthEnd,
  getMonthStart,
  parseMonthKey,
  type CalendarFilter,
} from "@/lib/calendar"

export const revalidate = 3600
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const monthParam = searchParams.get("month")
    const filter = (searchParams.get("filter") || "all") as CalendarFilter

    if (filter !== "all" && filter !== "movie" && filter !== "tv") {
      return NextResponse.json({ error: "Filtre invalide." }, { status: 400 })
    }

    const anchor = monthParam ? parseMonthKey(monthParam) : new Date()
    const monthStart = getMonthStart(anchor)
    const monthEnd = getMonthEnd(monthStart)
    const items = await fetchCalendarItemsForRange(monthStart, monthEnd)
    const data = buildCalendarMonth(monthStart, items, filter)

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json({ error: "Impossible de charger le calendrier." }, { status: 500 })
  }
}
