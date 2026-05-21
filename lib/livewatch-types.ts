export type LiveWatchTab = "tv" | "daddy" | "sports" | "football" | "events"

export interface LiveWatchTvChannel {
  id: string
  name: string
  logo?: string | null
  category?: string | null
  country?: string | null
  embed_url: string
  backup_embed_url?: string | null
}

export interface LiveWatchDaddyChannel {
  id: string
  name: string
  country?: string | null
  embed_url: string
}

export interface LiveWatchSportEvent {
  id: string
  title: string
  sport?: string | null
  league?: string | null
  time?: string | null
  isLive?: boolean
  popular?: boolean
  home?: string | null
  away?: string | null
  home_badge?: string | null
  away_badge?: string | null
  embed_url: string
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
  embed_url: string
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
  channels?: LiveWatchTvChannel[] | LiveWatchDaddyChannel[]
  events?: LiveWatchSportEvent[]
  matches?: LiveWatchFootballMatch[]
}

export interface LiveWatchPlayerTarget {
  title: string
  embedUrl: string
  backupEmbedUrl?: string | null
}
