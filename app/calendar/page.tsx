import { getCalendarMonth } from "@/lib/calendar"
import CalendarPage from "./calendar"

export const metadata = {
  title: "Calendrier - SpyderCast",
  description: "Sorties cinema et nouveaux episodes de series.",
}

export const revalidate = 3600

export default async function Page() {
  const initialData = await getCalendarMonth(new Date())

  return <CalendarPage initialData={initialData} />
}
