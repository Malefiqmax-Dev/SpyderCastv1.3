"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Footer } from "@/components/layout/footer"
import { LiveWatchEmbedModal } from "@/components/livewatch/livewatch-embed-modal"
import { SmartlinkPopup } from "@/components/player/smartlink-popup"
import { TV_COUNTRIES } from "@/lib/livewatch"
import type {
  LiveWatchBossTvMatch,
  LiveWatchChannel,
  LiveWatchEmbedResponse,
  LiveWatchFootballMatch,
  LiveWatchPlayerTarget,
  LiveWatchSportEvent,
  LiveWatchTab,
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
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "football", label: "Football", icon: Goal },
  { id: "bosstv", label: "Boss TV", icon: Tv },
  { id: "channels", label: "Chaines Tv", icon: Satellite },
  { id: "daddy", label: "DaddyTV", icon: Radio },
  { id: "sportsInfo", label: "Planning", icon: CalendarDays },
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
  const [activeTab, setActiveTab] = useState<LiveWatchTab>("sports")
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
      setError("Impossible de charger le contenu.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [activeTab, sport, debouncedSearch])

  useEffect(() => {
    loadData()
  }, [loadData])

  const sports = useMemo(() => data?.sports ?? [], [data?.sports])

  const sportEvents = data?.events ?? []
  const footballMatches = data?.matches ?? []
  const bossTvMatches = (data?.matches ?? data?.channels ?? []) as LiveWatchBossTvMatch[]
  const tvChannels = data?.tvChannels ?? []
  const daddyChannels = data?.daddyChannels ?? []

  const sportsArray = Array.isArray(sports) ? sports : []
  const sportEventsArray = Array.isArray(sportEvents) ? sportEvents : []
  const footballMatchesArray = Array.isArray(footballMatches) ? footballMatches : []
  const bossTvMatchesArray = Array.isArray(bossTvMatches) ? bossTvMatches : []
  const tvChannelsArray = Array.isArray(tvChannels) ? tvChannels : []
  const daddyChannelsArray = Array.isArray(daddyChannels) ? daddyChannels : []

  const totalLabel = useMemo(() => {
    if (!data) return null
    if (activeTab === "football") {
      return `${data.live_count ?? 0} matchs en direct · ${data.total ?? footballMatchesArray.length} affiches`
    }
    if (activeTab === "sports") {
      return `${data.live_count ?? 0} live · ${data.total ?? sportEventsArray.length} evenements`
    }
    if (activeTab === "bosstv") {
      return `${data.live_count ?? 0} en direct · ${data.total ?? bossTvMatchesArray.length} matchs`
    }
    if (activeTab === "sportsInfo") {
      return `${data.total_days ?? 0} jours · ${data.total ?? 0} evenements`
    }
    if (activeTab === "channels") {
      return `${data.total ?? tvChannelsArray.length} chaines`
    }
    if (activeTab === "daddy") {
      return `${data.total ?? daddyChannelsArray.length} chaines`
    }
    return `${data.total ?? 0} resultats`
  }, [activeTab, data, footballMatchesArray, sportEventsArray, bossTvMatchesArray, tvChannelsArray, daddyChannelsArray])

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

            {activeTab === "sports" && sportsArray.length > 0 && (
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="live-sport-select"
              >
                <option value="all">Tous les sports</option>
                {sportsArray.map((item) => (
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

          {!loading && !error && activeTab === "sports" && (
            <div className="live-sport-events">
              {sportEventsArray.map((event) => (
                <SportEventCard key={event.id} event={event} onPlay={openPlayer} />
              ))}
            </div>
          )}

          {!loading && !error && activeTab === "football" && (
            <div className="live-sport-events">
              {footballMatchesArray.map((match) => (
                <FootballMatchCard key={match.id} match={match} onPlay={openPlayer} />
              ))}
            </div>
          )}

          {!loading && !error && activeTab === "bosstv" && (
            <div className="live-sport-events">
              {bossTvMatchesArray.map((match) => (
                <BossTvMatchCard key={match.id} match={match} onPlay={openPlayer} />
              ))}
            </div>
          )}

          {!loading && !error && activeTab === "sportsInfo" && (
            <div className="live-sport-events">
              {sportEventsArray.map((event) => (
                <SportEventCard key={event.id} event={event} onPlay={openPlayer} />
              ))}
            </div>
          )}

          {!loading && !error && activeTab === "channels" && (
            <div className="live-sport-events">
              {tvChannelsArray.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} onPlay={openPlayer} />
              ))}
            </div>
          )}

          {!loading && !error && activeTab === "daddy" && (
            <div className="live-sport-events">
              {daddyChannelsArray.map((channel) => (
                <DaddyChannelCard key={channel.id} channel={channel} onPlay={openPlayer} />
              ))}
            </div>
          )}

          {!loading && !error && isEmpty(activeTab, sportEventsArray, footballMatchesArray, bossTvMatchesArray, tvChannelsArray, daddyChannelsArray) && (
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
  events: LiveWatchSportEvent[],
  matches: LiveWatchFootballMatch[],
  bossTvMatches: LiveWatchBossTvMatch[],
  tvChannels: LiveWatchChannel[],
  daddyChannels: LiveWatchChannel[],
) {
  if (tab === "sports") return events.length === 0
  if (tab === "football") return matches.length === 0
  if (tab === "bosstv") return bossTvMatches.length === 0
  if (tab === "sportsInfo") return events.length === 0
  if (tab === "channels") return tvChannels.length === 0
  if (tab === "daddy") return daddyChannels.length === 0
  return true
}

function SportEventCard({
  event,
  onPlay,
}: {
  event: LiveWatchSportEvent
  onPlay: (target: LiveWatchPlayerTarget) => void
}) {
  const firstEmbed = event.embeds?.[0]
  if (!firstEmbed) return null

  return (
    <button
      type="button"
      onClick={() => onPlay({ title: event.title, embedUrl: firstEmbed.embed_url })}
      className="live-sport-event-card"
    >
      <div className="live-sport-event-badges">
        {event.is_live && <span className="live-sport-live-badge">LIVE</span>}
        {event.sport && <span className="live-sport-sport-badge">{SPORT_LABELS[event.sport] ?? event.sport}</span>}
        {event.popular && <span className="live-sport-popular-badge">Populaire</span>}
      </div>

      <div className="live-sport-event-body">
        <div className="live-sport-event-teams">
          {event.home_badge && (
            <img 
              src={event.home_badge} 
              alt="" 
              className="live-sport-team-logo" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
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
            <img 
              src={event.away_badge} 
              alt="" 
              className="live-sport-team-logo" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
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
  const firstEmbed = match.embeds?.[0]
  if (!firstEmbed) return null

  return (
    <button
      type="button"
      onClick={() => onPlay({ title: match.title, embedUrl: firstEmbed.embed_url })}
      className="live-sport-event-card"
    >
      <div className="live-sport-event-badges">
        {match.is_live && <span className="live-sport-live-badge">LIVE</span>}
        {match.league && <span className="live-sport-sport-badge">{match.league}</span>}
      </div>

      <div className="live-sport-football-row">
        <div className="live-sport-football-team">
          {match.home_logo && (
            <img 
              src={match.home_logo} 
              alt="" 
              className="live-sport-team-logo" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
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
            <img 
              src={match.away_logo} 
              alt="" 
              className="live-sport-team-logo" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          )}
        </div>
      </div>

      {match.time_label && <p className="live-sport-event-time">{match.time_label}</p>}
    </button>
  )
}

function BossTvMatchCard({
  match,
  onPlay,
}: {
  match: LiveWatchBossTvMatch
  onPlay: (target: LiveWatchPlayerTarget) => void
}) {
  const firstEmbed = match.embeds?.[0]
  if (!firstEmbed) return null

  const badges = []
  if (match.is_live) {
    badges.push(<span key="live" className="live-sport-live-badge">LIVE</span>)
  }
  if (match.is_finished) {
    badges.push(<span key="finished" className="live-sport-finished-badge">Terminé</span>)
  }
  badges.push(<span key="league" className="live-sport-sport-badge">{match.league}</span>)

  return (
    <button
      type="button"
      onClick={() => onPlay({ title: match.title, embedUrl: firstEmbed.embed_url })}
      className="live-sport-event-card"
    >
      <div className="live-sport-event-badges">
        {badges}
      </div>

      <div className="live-sport-football-row">
        <div className="live-sport-football-team">
          {match.home_logo && (
            <img 
              src={match.home_logo} 
              alt="" 
              className="live-sport-team-logo" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          )}
          <span>{match.home}</span>
        </div>

        <div className="live-sport-football-score">
          <span>VS</span>
        </div>

        <div className="live-sport-football-team live-sport-football-team-away">
          <span>{match.away}</span>
          {match.away_logo && (
            <img 
              src={match.away_logo} 
              alt="" 
              className="live-sport-team-logo" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          )}
        </div>
      </div>

      <p className="live-sport-event-time">{match.time_label}</p>
    </button>
  )
}

function ChannelCard({
  channel,
  onPlay,
}: {
  channel: LiveWatchChannel
  onPlay: (target: LiveWatchPlayerTarget) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay({ title: channel.name, embedUrl: channel.embed_url })}
      className="live-sport-event-card"
    >
      <div className="live-sport-event-badges">
        <span className="live-sport-sport-badge">{channel.country}</span>
        {channel.categories.length > 0 && (
          <span className="live-sport-sport-badge">{channel.categories[0]}</span>
        )}
      </div>

      <div className="live-sport-event-body">
        <div className="live-sport-event-info">
          <p className="live-sport-event-title">{channel.name}</p>
          <p className="live-sport-event-league">{channel.source}</p>
        </div>
      </div>
    </button>
  )
}

function DaddyChannelCard({
  channel,
  onPlay,
}: {
  channel: LiveWatchChannel
  onPlay: (target: LiveWatchPlayerTarget) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay({ title: channel.name, embedUrl: channel.embed_url })}
      className="live-sport-event-card"
    >
      <div className="live-sport-event-badges">
        <span className="live-sport-sport-badge">{channel.country}</span>
        <span className="live-sport-sport-badge">{(channel as any).category || "General"}</span>
      </div>

      <div className="live-sport-event-body">
        <div className="live-sport-event-info">
          <p className="live-sport-event-title">{channel.name}</p>
        </div>
      </div>
    </button>
  )
}
