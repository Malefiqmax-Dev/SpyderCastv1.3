"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Footer } from "@/components/layout/footer"
import { CalendarCard } from "@/components/calendar/calendar-card"
import type { CalendarFilter, CalendarMonthData } from "@/lib/calendar"
import { getMonthKey, shiftMonth } from "@/lib/calendar"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Loader2,
  Tv,
} from "lucide-react"
import "./calendar.css"

interface CalendarPageProps {
  initialData: CalendarMonthData
}

const FILTERS: { id: CalendarFilter; label: string; icon: typeof Clapperboard }[] = [
  { id: "all", label: "Tout", icon: CalendarDays },
  { id: "movie", label: "Films", icon: Clapperboard },
  { id: "tv", label: "Series", icon: Tv },
]

const DAY_OPTIONS = [
  { value: "", label: "Tous les jours" },
  ...Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: String(i + 1),
  })),
]

const MONTH_OPTIONS = [
  { value: "01", label: "Janvier" },
  { value: "02", label: "Fevrier" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Aout" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Decembre" },
]

function buildYearOptions() {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, index) => String(currentYear - 1 + index))
}

export default function CalendarPage({ initialData }: CalendarPageProps) {
  const [data, setData] = useState<CalendarMonthData>(initialData)
  const [filter, setFilter] = useState<CalendarFilter>("all")
  const [monthKey, setMonthKey] = useState(initialData.month)
  const [selectedDay, setSelectedDay] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const skipInitialFetch = useRef(true)

  const yearOptions = useMemo(() => buildYearOptions(), [])
  const selectedYear = monthKey.slice(0, 4)
  const selectedMonth = monthKey.slice(5, 7)

  const loadMonth = useCallback(async (month: string, activeFilter: CalendarFilter) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ month, filter: activeFilter })
      const res = await fetch(`/api/calendar?${params.toString()}`)
      if (!res.ok) throw new Error("fetch_failed")
      const json = (await res.json()) as CalendarMonthData
      setData(json)
    } catch {
      setError("Impossible de charger le calendrier.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (
      skipInitialFetch.current &&
      monthKey === initialData.month &&
      filter === "all"
    ) {
      skipInitialFetch.current = false
      return
    }

    skipInitialFetch.current = false
    loadMonth(monthKey, filter)
  }, [monthKey, filter, loadMonth, initialData.month])

  function changeMonth(offset: number) {
    setMonthKey((current) => shiftMonth(current, offset))
  }

  function goToToday() {
    setMonthKey(getMonthKey())
  }

  function handleMonthChange(value: string) {
    setMonthKey(`${selectedYear}-${value}`)
  }

  function handleYearChange(value: string) {
    setMonthKey(`${value}-${selectedMonth}`)
  }

  function handleDayChange(value: string) {
    setSelectedDay(value)
  }

  return (
    <main className="calendar-main">
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <div className="calendar-header-icon-wrap">
            <CalendarDays className="calendar-header-icon" />
          </div>
          <div>
            <h1 className="calendar-title">Calendrier des sorties</h1>
            <p className="calendar-subtitle">
              Vue mensuelle — episodes precis et integrales regroupees
            </p>
          </div>
        </div>

        <div className="calendar-controls">
          <div className="calendar-period-nav">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="calendar-nav-btn"
              aria-label="Mois precedent"
            >
              <ChevronLeft className="calendar-nav-icon" />
            </button>

            <div className="calendar-period-selects">
              <select
                value={selectedDay}
                onChange={(e) => handleDayChange(e.target.value)}
                className="calendar-select"
                aria-label="Choisir le jour"
              >
                {DAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="calendar-select"
                aria-label="Choisir le mois"
              >
                {MONTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="calendar-select calendar-select-year"
                aria-label="Choisir l'annee"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button type="button" onClick={goToToday} className="calendar-today-btn">
                Aujourd&apos;hui
              </button>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="calendar-nav-btn"
              aria-label="Mois suivant"
            >
              <ChevronRight className="calendar-nav-icon" />
            </button>
          </div>

          <p className="calendar-period-label">{data.periodLabel}</p>

          <div className="calendar-filters">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`calendar-filter-btn ${filter === item.id ? "calendar-filter-btn-active" : "calendar-filter-btn-inactive"}`}
              >
                <item.icon className="calendar-filter-icon" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && (
          <p className="calendar-meta">
            {data.totalItems} sortie{data.totalItems > 1 ? "s" : ""} ce mois-ci
          </p>
        )}

        {loading && (
          <div className="calendar-loading">
            <Loader2 className="calendar-loader" />
            <p>Chargement du calendrier...</p>
          </div>
        )}

        {error && !loading && <div className="calendar-error">{error}</div>}

        {!loading && !error && data.days.length === 0 && (
          <div className="calendar-day-empty calendar-week-empty">
            <p>Aucune sortie populaire ce mois-ci.</p>
          </div>
        )}

        {!loading && !error && data.days.length > 0 && (
          <div className="calendar-days">
            {data.days
              .filter((day) => !selectedDay || day.date.slice(8, 10) === selectedDay)
              .map((day) => (
              <section
                key={day.date}
                className={`calendar-day ${day.isToday ? "calendar-day-today" : ""}`}
              >
                <div className="calendar-day-header">
                  <div>
                    <h2 className="calendar-day-title">{day.label}</h2>
                    {day.isToday && <span className="calendar-today-badge">Aujourd&apos;hui</span>}
                  </div>
                  <span className="calendar-day-count">
                    {day.items.length} sortie{day.items.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="calendar-grid">
                  {day.items.map((item) => (
                    <CalendarCard
                      key={`${item.mediaType}-${item.id}-${item.releaseDate}-${item.episodeInfo?.season ?? 0}-${item.episodeInfo?.episode ?? item.episodeInfo?.episodeCount ?? 0}`}
                      item={item}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
