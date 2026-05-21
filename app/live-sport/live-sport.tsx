"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Footer } from "@/components/layout/footer"
import { LiveWatchEmbedModal } from "@/components/livewatch/livewatch-embed-modal"
import { SmartlinkPopup } from "@/components/player/smartlink-popup"
import { TV_COUNTRIES } from "@/lib/livewatch"
import type {
  LiveWatchDaddyChannel,
  LiveWatchEmbedResponse,
  LiveWatchFootballMatch,
  LiveWatchPlayerTarget,
  LiveWatchSportEvent,
  LiveWatchTab,
  LiveWatchTvChannel,
} from "@/lib/livewatch-types"
import {
  Loader2,
  Radio,
  Search,
  Tv,
  Trophy,
  Goal,
  CalendarDays,
  Satellite,
} from "lucide-react"
import "./live-sport.css"

const TABS: { id: LiveWatchTab; label: string; icon: typeof Tv }[] = [
  { id: "tv", label: "TV", icon: Tv },
  { id: "daddy", label: "Daddy TV", icon: Satellite },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "football", label: "Football", icon: Goal },
  { id: "events", label: "Evenements", icon: CalendarDays },
]

const SPORT_LABELS: Record<string, string> = {
  football: "Football",
  hockey: "Hockey",
  basketball: "Basket",
  tennis: "Tennis",
  baseball: "Baseball",
  rugby: "Rugby",
  cricket: "Cricket",
  "motor-sports": "Moto",
  fight: "Combat",
  "american-football": "NFL",
  other: "Autre",
}

function ChannelLogo({ src, name }: { src?: string | null; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="live-sport-card-logo-img"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
    )
  }

  return <Tv className="live-sport-card-logo-fallback" />
}

export default function LiveSportPage() {
  const [activeTab, setActiveTab] = useState<LiveWatchTab>("tv")
  const [country, setCountry] = useState("France")
  const [sport, setSport] = useState("all")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [data, setData] = useState<LiveWatchEmbedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [player, setPlayer] = useState<LiveWatchPlayerTarget | null>(null)
  const [adOpen, setAdOpen] = useState(false)
  const [pendingPlayer, setPendingPlayer] = useState<LiveWatchPlayerTarget | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ type: activeTab })

      if ((activeTab === "tv" || activeTab === "daddy") && country !== "all") {
        params.set("country", country)
      }

      if (activeTab === "sports" && sport !== "all") {
        params.set("sport", sport)
      }

      if (debouncedSearch) {
        params.set("search", debouncedSearch)
      }

      const res = await fetch(`/api/livewatch?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) throw new Error("fetch_failed")

      const json = (await res.json()) as LiveWatchEmbedResponse
      setData(json)
    } catch {
      setError("Impossible de charger le contenu LiveWatch.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [activeTab, country, sport, debouncedSearch])

  useEffect(() => {
    loadData()
  }, [loadData])

  const countries = useMemo(() => {
    if (data?.countries?.length) return data.countries
    if (activeTab === "tv") return [...TV_COUNTRIES]
    return [...TV_COUNTRIES]
  }, [data?.countries, activeTab])

  const sports = useMemo(() => data?.sports ?? [], [data?.sports])

  const tvChannels = (data?.channels ?? []) as LiveWatchTvChannel[]
  const daddyChannels = (data?.channels ?? []) as LiveWatchDaddyChannel[]
  const sportEvents = data?.events ?? []
  const footballMatches = data?.matches ?? []

  const totalLabel = useMemo(() => {
    if (!data) return null
    if (activeTab === "football") {
      return `${data.live_count ?? 0} matchs en direct · ${data.total ?? footballMatches.length} affiches`
    }
    if (activeTab === "sports") {
      return `${data.live_count ?? 0} live · ${data.total ?? sportEvents.length} evenements`
    }
    if (activeTab === "tv") {
      return `${data.total ?? tvChannels.length} chaines · ${data.alt_total ?? 0} secours dispo`
    }
    return `${data.total ?? 0} resultats`
  }, [activeTab, data, footballMatches.length, sportEvents.length, tvChannels.length])

  function openPlayer(target: LiveWatchPlayerTarget) {
    setPendingPlayer(target)
    setAdOpen(true)
  }

  return (
    <main className="live-sport-main">
      <div className="live-sport-wrapper">
        <div className="live-sport-container">
          <div className="live-sport-header">
            <div className="live-sport-header-row">
              <div className="live-sport-icon-wrap">
                <Radio className="live-sport-header-icon" />
              </div>
              <div>
                <h1 className="live-sport-title">Live TV & Sport</h1>
                <p className="live-sport-subtitle">
                  Chaînes TV, matchs et evenements en direct via SpyderTV
                </p>
              </div>
            </div>
          </div>

          <div className="live-sport-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  setSearch("")
                  setDebouncedSearch("")
                }}
                className={`live-sport-tab ${activeTab === tab.id ? "live-sport-tab-active" : "live-sport-tab-inactive"}`}
              >
                <tab.icon className="live-sport-tab-icon" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="live-sport-toolbar">
            <div className="live-sport-search-wrap">
              <Search className="live-sport-search-icon" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="live-sport-search-input"
              />
            </div>

            {(activeTab === "tv" || activeTab === "daddy") && (
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="live-sport-select"
              >
                <option value="all">Tous les pays</option>
                {countries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "sports" && sports.length > 0 && (
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="live-sport-select"
              >
                <option value="all">Tous les sports</option>
                {sports.map((item) => (
                  <option key={item} value={item}>
                    {SPORT_LABELS[item] ?? item}
                    {data?.sport_counts?.[item] ? ` (${data.sport_counts[item]})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {totalLabel && !loading && !error && (
            <p className="live-sport-meta">{totalLabel}</p>
          )}

          {loading && (
            <div className="live-sport-loading">
              <Loader2 className="live-sport-loader" />
              <p>Chargement SpyderTV...</p>
            </div>
          )}

          {error && !loading && <div className="live-sport-error">{error}</div>}

          {!loading && !error && activeTab === "tv" && (
            <div className="live-sport-grid">
              {tvChannels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() =>
                    openPlayer({
                      title: channel.name,
                      embedUrl: channel.embed_url,
                      backupEmbedUrl: channel.backup_embed_url,
                    })
                  }
                  className="live-sport-card"
                >
                  <div className="live-sport-card-logo-wrap">
                    <ChannelLogo src={channel.logo} name={channel.name} />
                  </div>
                  <p className="live-sport-card-title">{channel.name}</p>
                  <p className="live-sport-card-meta">
                    {[channel.category, channel.country].filter(Boolean).join(" · ")}
                  </p>
                  {channel.backup_embed_url && (
                    <span className="live-sport-card-badge">Secours</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {!loading && !error && activeTab === "daddy" && (
            <div className="live-sport-grid">
              {daddyChannels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() =>
                    openPlayer({
                      title: channel.name,
                      embedUrl: channel.embed_url,
                    })
                  }
                  className="live-sport-card"
                >
                  <div className="live-sport-card-logo-wrap">
                    <ChannelLogo name={channel.name} />
                  </div>
                  <p className="live-sport-card-title">{channel.name}</p>
                  <p className="live-sport-card-meta">{channel.country ?? "Daddy TV"}</p>
                </button>
              ))}
            </div>
          )}

          {!loading && !error && (activeTab === "sports" || activeTab === "events") && (
            <div className="live-sport-events">
              {sportEvents.map((event) => (
                <SportEventCard key={event.id} event={event} onPlay={openPlayer} />
              ))}
            </div>
          )}

          {!loading && !error && activeTab === "football" && (
            <div className="live-sport-events">
              {footballMatches.map((match) => (
                <FootballMatchCard key={match.id} match={match} onPlay={openPlayer} />
              ))}
            </div>
          )}

          {!loading && !error && isEmpty(activeTab, tvChannels, daddyChannels, sportEvents, footballMatches) && (
            <div className="live-sport-empty">
              <p>Aucun contenu disponible pour cette selection.</p>
            </div>
          )}
        </div>
      </div>

      {adOpen && pendingPlayer && (
        <SmartlinkPopup
          title={pendingPlayer.title}
          maxSteps={1}
          onClose={() => {
            setAdOpen(false)
            setPlayer(pendingPlayer)
            setPendingPlayer(null)
          }}
        />
      )}

      {player && (
        <LiveWatchEmbedModal
          title={player.title}
          embedUrl={player.embedUrl}
          backupEmbedUrl={player.backupEmbedUrl}
          onClose={() => setPlayer(null)}
        />
      )}

      <Footer />
    </main>
  )
}

function isEmpty(
  tab: LiveWatchTab,
  tv: LiveWatchTvChannel[],
  daddy: LiveWatchDaddyChannel[],
  events: LiveWatchSportEvent[],
  matches: LiveWatchFootballMatch[],
) {
  if (tab === "tv") return tv.length === 0
  if (tab === "daddy") return daddy.length === 0
  if (tab === "football") return matches.length === 0
  return events.length === 0
}

function SportEventCard({
  event,
  onPlay,
}: {
  event: LiveWatchSportEvent
  onPlay: (target: LiveWatchPlayerTarget) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay({ title: event.title, embedUrl: event.embed_url })}
      className="live-sport-event-card"
    >
      <div className="live-sport-event-badges">
        {event.isLive && <span className="live-sport-live-badge">LIVE</span>}
        {event.sport && <span className="live-sport-sport-badge">{SPORT_LABELS[event.sport] ?? event.sport}</span>}
        {event.popular && <span className="live-sport-popular-badge">Populaire</span>}
      </div>

      <div className="live-sport-event-body">
        <div className="live-sport-event-teams">
          {event.home_badge && (
            <img src={event.home_badge} alt="" className="live-sport-team-logo" loading="lazy" />
          )}
          <div className="live-sport-event-info">
            <p className="live-sport-event-title">{event.title}</p>
            {(event.home || event.away) && (
              <p className="live-sport-event-subtitle">
                {[event.home, event.away].filter(Boolean).join(" vs ")}
              </p>
            )}
            {event.league && <p className="live-sport-event-league">{event.league}</p>}
          </div>
          {event.away_badge && (
            <img src={event.away_badge} alt="" className="live-sport-team-logo" loading="lazy" />
          )}
        </div>
        {event.time && <p className="live-sport-event-time">{event.time}</p>}
      </div>
    </button>
  )
}

function FootballMatchCard({
  match,
  onPlay,
}: {
  match: LiveWatchFootballMatch
  onPlay: (target: LiveWatchPlayerTarget) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay({ title: match.title, embedUrl: match.embed_url })}
      className="live-sport-event-card"
    >
      <div className="live-sport-event-badges">
        {match.is_live && <span className="live-sport-live-badge">LIVE</span>}
        {match.league && <span className="live-sport-sport-badge">{match.league}</span>}
      </div>

      <div className="live-sport-football-row">
        <div className="live-sport-football-team">
          {match.home_logo && (
            <img src={match.home_logo} alt="" className="live-sport-team-logo" loading="lazy" />
          )}
          <span>{match.home ?? "—"}</span>
        </div>

        <div className="live-sport-football-score">
          <span>{match.home_score ?? "0"}</span>
          <span className="live-sport-football-sep">:</span>
          <span>{match.away_score ?? "0"}</span>
        </div>

        <div className="live-sport-football-team live-sport-football-team-away">
          <span>{match.away ?? "—"}</span>
          {match.away_logo && (
            <img src={match.away_logo} alt="" className="live-sport-team-logo" loading="lazy" />
          )}
        </div>
      </div>

      {match.time_label && <p className="live-sport-event-time">{match.time_label}</p>}
    </button>
  )
}
