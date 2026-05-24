export type LiveWatchTab = "sports" | "football" | "bosstv" | "sportsInfo"

export interface LiveWatchEmbed {
  label: string
  embed_url: string
}

export interface LiveWatchSportEvent {
  id: string
  title: string
  sport?: string | null
  league?: string | null
  time?: string | null
  is_live?: boolean
  popular?: boolean
  home?: string | null
  away?: string | null
  home_badge?: string | null
  away_badge?: string | null
  embeds: LiveWatchEmbed[]
}

export interface LiveWatchFootballMatch {
  id: string
  title: string
  home?: string | null
  away?: string | null
  home_logo?: string | null
  away_logo?: string | null
  home_score?: string | null
  away_score?: string | null
  league?: string | null
  league_logo?: string | null
  is_live?: boolean
  status?: string | null
  time_label?: string | null
  embeds: LiveWatchEmbed[]
}

export interface LiveWatchBossTvMatch {
  id: string
  title: string
  home: string
  away: string
  home_logo?: string | null
  away_logo?: string | null
  league: string
  status: string
  is_live: boolean
  is_finished: boolean
  timestamp: number
  time_label: string
  embeds: LiveWatchEmbed[]
}

export interface LiveWatchEmbedResponse {
  type: LiveWatchTab
  total?: number
  alt_total?: number
  countries?: string[]
  sports?: string[]
  sport_counts?: Record<string, number>
  leagues?: string[]
  live_count?: number
  popular_count?: number
  upcoming_count?: number
  finished_count?: number
  league_count?: number
  total_days?: number
  days?: any[]
  events?: LiveWatchSportEvent[]
  matches?: LiveWatchFootballMatch[]
  channels?: LiveWatchBossTvMatch[]
}

export interface LiveWatchPlayerTarget {
  title: string
  embedUrl: string
  backupEmbedUrl?: string | null
}
