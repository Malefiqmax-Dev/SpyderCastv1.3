import {
  discoverMoviesByDateRange,
  discoverTVByDateRange,
  getAiringTodayTV,
  getOnTheAirTV,
  getTVCalendarDetails,
  getTVSeasonDetails,
} from "@/lib/tmdb"

export type CalendarFilter = "all" | "movie" | "tv"

export interface CalendarEpisodeInfo {
  season: number
  episode?: number
  episodeTitle?: string
  episodeCount?: number
  episodeRange?: string
  isBatch: boolean
}

export interface CalendarItem {
  id: number
  title: string
  posterPath: string
  voteAverage: number
  voteCount: number
  popularity: number
  mediaType: "movie" | "tv"
  releaseDate: string
  episodeInfo?: CalendarEpisodeInfo
  episodeLabel?: string
}

export interface CalendarDay {
  date: string
  label: string
  isToday: boolean
  items: CalendarItem[]
}

export interface CalendarMonthData {
  month: string
  periodStart: string
  periodEnd: string
  periodLabel: string
  days: CalendarDay[]
  totalItems: number
}

/** @deprecated Alias pour compatibilite interne */
export type CalendarWeekData = CalendarMonthData

interface TmdbEpisode {
  air_date?: string | null
  episode_number: number
  name: string
  season_number: number
}

interface ShowCandidate {
  id: number
  name: string
  poster_path: string
  vote_average: number
  vote_count: number
  popularity: number
  seasonsToScan: Set<number>
}

function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getWeekStart(date: Date): Date {
  const start = new Date(date)
  const weekday = start.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

export function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function getWeekDays(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart)
    day.setDate(day.getDate() + index)
    return toDateString(day)
  })
}

function formatDayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`)
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date)
}

function formatWeekLabel(weekStart: Date, weekEnd: Date): string {
  const startFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(weekStart)
  const endFmt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(weekEnd)
  return `${startFmt} — ${endFmt}`
}

const MIN_VOTE_AVERAGE = 6
const MIN_VOTE_COUNT = 25
const MIN_POPULARITY = 8
const MAX_ITEMS_PER_DAY = 8
const MAX_SHOWS_TO_SCAN = 32
const BATCH_EPISODE_THRESHOLD = 2

function hasValidPoster(path: unknown): path is string {
  return typeof path === "string" && path.trim().length > 0
}

function isPopularEnough(voteAverage: number, voteCount: number, popularity: number): boolean {
  if (popularity >= MIN_POPULARITY) return true
  if (voteAverage >= MIN_VOTE_AVERAGE && voteCount >= MIN_VOTE_COUNT) return true
  if (voteAverage >= 7.5 && voteCount >= 10) return true
  return false
}

function rankItem(item: CalendarItem): number {
  return item.popularity * 3 + item.voteAverage * 8 + Math.min(item.voteCount, 1000) * 0.05
}

function formatEpisodeNumber(value: number): string {
  return String(value).padStart(2, "0")
}

function normalizeEpisodeTitle(title: string | undefined, episodeNumber?: number): string | null {
  if (!title?.trim()) return null

  const cleaned = title.trim()
  if (!episodeNumber) return cleaned

  const redundantPatterns = [
    new RegExp(`^episode\\s*#?\\s*0*${episodeNumber}\\s*$`, "i"),
    new RegExp(`^ep(?:isode)?\\.?\\s*#?\\s*0*${episodeNumber}\\s*$`, "i"),
    new RegExp(`^e\\s*0*${episodeNumber}\\s*$`, "i"),
    new RegExp(`^0*${episodeNumber}\\s*$`),
    new RegExp(`^episode\\s+0*${episodeNumber}\\b`, "i"),
    new RegExp(`^ep\\.\\s*0*${episodeNumber}\\b`, "i"),
  ]

  if (redundantPatterns.some((pattern) => pattern.test(cleaned))) return null

  return cleaned
}

function buildEpisodeLabel(info: CalendarEpisodeInfo): string {
  if (info.isBatch && info.episodeCount) {
    const range = info.episodeRange ? ` (${info.episodeRange})` : ""
    return `Saison ${info.season} · Integrale · ${info.episodeCount} episodes${range}`
  }

  const base = info.episode
    ? `Saison ${info.season} · Episode ${info.episode}`
    : `Saison ${info.season}`

  const title = normalizeEpisodeTitle(info.episodeTitle, info.episode)
  return title ? `${base} · ${title}` : base
}

function parseMovieItem(
  raw: Record<string, unknown>,
  releaseDate: string,
): CalendarItem | null {
  const posterPath = raw.poster_path
  if (!hasValidPoster(posterPath)) return null

  const voteAverage = (raw.vote_average as number) ?? 0
  const voteCount = (raw.vote_count as number) ?? 0
  const popularity = (raw.popularity as number) ?? 0

  if (!isPopularEnough(voteAverage, voteCount, popularity)) return null

  return {
    id: raw.id as number,
    title: (raw.title as string) || "Sans titre",
    posterPath,
    voteAverage,
    voteCount,
    popularity,
    mediaType: "movie",
    releaseDate,
  }
}

function itemKey(item: CalendarItem): string {
  if (item.mediaType === "movie") {
    return `movie-${item.id}-${item.releaseDate}`
  }

  const episode = item.episodeInfo
  if (!episode) return `tv-${item.id}-${item.releaseDate}`

  if (episode.isBatch) {
    return `tv-${item.id}-${item.releaseDate}-s${episode.season}-batch`
  }

  return `tv-${item.id}-${item.releaseDate}-s${episode.season}-e${episode.episode}`
}

function dedupeItems(items: CalendarItem[]): CalendarItem[] {
  const seen = new Set<string>()
  const result: CalendarItem[] = []

  for (const item of items) {
    const key = itemKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }

  return result.sort((a, b) => {
    if (a.releaseDate !== b.releaseDate) return a.releaseDate.localeCompare(b.releaseDate)
    return rankItem(b) - rankItem(a)
  })
}

async function fetchPagedResults<T>(
  fetchPage: (page: number) => Promise<{ results?: T[]; total_pages?: number }>,
  maxPages = 1,
): Promise<T[]> {
  const results: T[] = []

  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchPage(page)
    const batch = data.results ?? []
    results.push(...batch)
    if (!batch.length || page >= (data.total_pages ?? page)) break
  }

  return results
}

function parseShowCandidate(raw: Record<string, unknown>, extraSeasons: number[] = []): ShowCandidate | null {
  const posterPath = raw.poster_path
  if (!hasValidPoster(posterPath)) return null

  const voteAverage = (raw.vote_average as number) ?? 0
  const voteCount = (raw.vote_count as number) ?? 0
  const popularity = (raw.popularity as number) ?? 0

  if (!isPopularEnough(voteAverage, voteCount, popularity)) return null

  return {
    id: raw.id as number,
    name: (raw.name as string) || "Sans titre",
    poster_path: posterPath,
    vote_average: voteAverage,
    vote_count: voteCount,
    popularity,
    seasonsToScan: new Set(extraSeasons),
  }
}

function mergeShowCandidates(candidates: ShowCandidate[]): ShowCandidate[] {
  const map = new Map<number, ShowCandidate>()

  for (const candidate of candidates) {
    const existing = map.get(candidate.id)
    if (!existing) {
      map.set(candidate.id, candidate)
      continue
    }

    existing.popularity = Math.max(existing.popularity, candidate.popularity)
    for (const season of candidate.seasonsToScan) {
      existing.seasonsToScan.add(season)
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, MAX_SHOWS_TO_SCAN)
}

function episodesToCalendarItems(
  show: ShowCandidate,
  episodes: TmdbEpisode[],
  start: string,
  end: string,
): CalendarItem[] {
  const groups = new Map<string, TmdbEpisode[]>()

  for (const episode of episodes) {
    if (!episode.air_date || episode.air_date < start || episode.air_date > end) continue

    const key = `${show.id}-${episode.season_number}-${episode.air_date}`
    const bucket = groups.get(key) ?? []
    bucket.push(episode)
    groups.set(key, bucket)
  }

  const items: CalendarItem[] = []

  for (const [, bucket] of groups) {
    bucket.sort((a, b) => a.episode_number - b.episode_number)
    const first = bucket[0]
    const releaseDate = first.air_date!
    const season = first.season_number

    if (bucket.length >= BATCH_EPISODE_THRESHOLD) {
      const episodeRange = `E${formatEpisodeNumber(first.episode_number)}–E${formatEpisodeNumber(bucket[bucket.length - 1].episode_number)}`
      const episodeInfo: CalendarEpisodeInfo = {
        season,
        episodeCount: bucket.length,
        episodeRange,
        isBatch: true,
      }

      items.push({
        id: show.id,
        title: show.name,
        posterPath: show.poster_path,
        voteAverage: show.vote_average,
        voteCount: show.vote_count,
        popularity: show.popularity,
        mediaType: "tv",
        releaseDate,
        episodeInfo,
        episodeLabel: buildEpisodeLabel(episodeInfo),
      })
      continue
    }

    for (const episode of bucket) {
      const episodeInfo: CalendarEpisodeInfo = {
        season: episode.season_number,
        episode: episode.episode_number,
        episodeTitle: episode.name,
        isBatch: false,
      }

      items.push({
        id: show.id,
        title: show.name,
        posterPath: show.poster_path,
        voteAverage: show.vote_average,
        voteCount: show.vote_count,
        popularity: show.popularity,
        mediaType: "tv",
        releaseDate: episode.air_date!,
        episodeInfo,
        episodeLabel: buildEpisodeLabel(episodeInfo),
      })
    }
  }

  return items
}

async function fetchShowEpisodeItems(
  show: ShowCandidate,
  start: string,
  end: string,
  seasonCache: Map<string, TmdbEpisode[]>,
): Promise<CalendarItem[]> {
  try {
    const details = await getTVCalendarDetails(show.id)

    const nextEpisode = details.next_episode_to_air as
      | { season_number?: number }
      | null
      | undefined
    const lastEpisode = details.last_episode_to_air as
      | { season_number?: number }
      | null
      | undefined

    if (nextEpisode?.season_number) show.seasonsToScan.add(nextEpisode.season_number)
    if (lastEpisode?.season_number) show.seasonsToScan.add(lastEpisode.season_number)

    if (show.seasonsToScan.size === 0 && typeof details.number_of_seasons === "number") {
      show.seasonsToScan.add(details.number_of_seasons)
    }

    const episodes: TmdbEpisode[] = []

    for (const seasonNumber of show.seasonsToScan) {
      if (seasonNumber <= 0) continue

      const cacheKey = `${show.id}-${seasonNumber}`
      let seasonEpisodes = seasonCache.get(cacheKey)

      if (!seasonEpisodes) {
        const seasonData = await getTVSeasonDetails(show.id, seasonNumber)
        seasonEpisodes = (seasonData.episodes ?? []) as TmdbEpisode[]
        seasonCache.set(cacheKey, seasonEpisodes)
      }

      episodes.push(...seasonEpisodes)
    }

    return episodesToCalendarItems(show, episodes, start, end)
  } catch {
    return []
  }
}

async function fetchTVCalendarItems(start: string, end: string): Promise<CalendarItem[]> {
  const [onTheAir, airingToday, tvPremieres] = await Promise.all([
    fetchPagedResults((page) => getOnTheAirTV(page)),
    fetchPagedResults((page) => getAiringTodayTV(page)),
    fetchPagedResults((page) => discoverTVByDateRange(start, end, page)),
  ])

  const candidates: ShowCandidate[] = []

  for (const show of onTheAir as Array<Record<string, unknown>>) {
    const candidate = parseShowCandidate(show)
    if (candidate) candidates.push(candidate)
  }

  for (const show of airingToday as Array<Record<string, unknown>>) {
    const candidate = parseShowCandidate(show)
    if (candidate) candidates.push(candidate)
  }

  for (const show of tvPremieres as Array<Record<string, unknown>>) {
    const premiereDate = show.first_air_date as string | undefined
    if (!premiereDate || premiereDate < start || premiereDate > end) continue

    const candidate = parseShowCandidate(show, [1])
    if (candidate) candidates.push(candidate)
  }

  const mergedShows = mergeShowCandidates(candidates)
  const seasonCache = new Map<string, TmdbEpisode[]>()
  const items: CalendarItem[] = []

  for (let index = 0; index < mergedShows.length; index += 6) {
    const batch = mergedShows.slice(index, index + 6)
    const batchItems = await Promise.all(
      batch.map((show) => fetchShowEpisodeItems(show, start, end, seasonCache)),
    )
    items.push(...batchItems.flat())
  }

  return items
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function getMonthDays(monthStart: Date): string[] {
  const end = getMonthEnd(monthStart)
  const days: string[] = []
  const cursor = new Date(monthStart)

  while (cursor <= end) {
    days.push(toDateString(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export function getMonthKey(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${date.getFullYear()}-${month}`
}

export function parseMonthKey(monthKey: string): Date {
  const [year, month] = monthKey.split("-").map(Number)
  return new Date(year, (month || 1) - 1, 1, 12, 0, 0, 0)
}

export function shiftMonth(monthKey: string, offset: number): string {
  const date = parseMonthKey(monthKey)
  date.setMonth(date.getMonth() + offset)
  return getMonthKey(date)
}

function formatMonthLabel(monthStart: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(monthStart)
}

export async function fetchCalendarItemsForRange(rangeStart: Date, rangeEnd: Date): Promise<CalendarItem[]> {
  const start = toDateString(rangeStart)
  const end = toDateString(rangeEnd)
  const items: CalendarItem[] = []

  const [movies, tvItems] = await Promise.all([
    fetchPagedResults((page) => discoverMoviesByDateRange(start, end, page), 2),
    fetchTVCalendarItems(start, end),
  ])

  for (const movie of movies as Array<Record<string, unknown>>) {
    const releaseDate = movie.release_date as string | undefined
    if (!releaseDate || releaseDate < start || releaseDate > end) continue

    const item = parseMovieItem(movie, releaseDate)
    if (item) items.push(item)
  }

  items.push(...tvItems)

  return dedupeItems(items)
}

export async function fetchCalendarItems(weekStart: Date): Promise<CalendarItem[]> {
  return fetchCalendarItemsForRange(weekStart, getWeekEnd(weekStart))
}

export function buildCalendarMonth(
  monthStart: Date,
  items: CalendarItem[],
  filter: CalendarFilter = "all",
): CalendarMonthData {
  const monthEnd = getMonthEnd(monthStart)
  const today = toDateString(new Date())
  const monthDays = getMonthDays(monthStart)

  const filtered =
    filter === "all" ? items : items.filter((item) => item.mediaType === filter)

  const allDays: CalendarDay[] = monthDays.map((date) => ({
    date,
    label: formatDayLabel(date),
    isToday: date === today,
    items: filtered
      .filter((item) => item.releaseDate === date)
      .sort((a, b) => rankItem(b) - rankItem(a))
      .slice(0, MAX_ITEMS_PER_DAY),
  }))

  const days = allDays.filter((day) => day.items.length > 0)

  return {
    month: getMonthKey(monthStart),
    periodStart: toDateString(monthStart),
    periodEnd: toDateString(monthEnd),
    periodLabel: formatMonthLabel(monthStart),
    days,
    totalItems: days.reduce((sum, day) => sum + day.items.length, 0),
  }
}

export async function getCalendarMonth(
  anchorDate: Date,
  filter: CalendarFilter = "all",
): Promise<CalendarMonthData> {
  const monthStart = getMonthStart(anchorDate)
  const monthEnd = getMonthEnd(monthStart)
  const items = await fetchCalendarItemsForRange(monthStart, monthEnd)
  return buildCalendarMonth(monthStart, items, filter)
}

export function buildCalendarWeek(
  weekStart: Date,
  items: CalendarItem[],
  filter: CalendarFilter = "all",
): CalendarMonthData {
  const weekEnd = getWeekEnd(weekStart)
  const today = toDateString(new Date())
  const weekDays = getWeekDays(weekStart)

  const filtered =
    filter === "all" ? items : items.filter((item) => item.mediaType === filter)

  const allDays: CalendarDay[] = weekDays.map((date) => ({
    date,
    label: formatDayLabel(date),
    isToday: date === today,
    items: filtered
      .filter((item) => item.releaseDate === date)
      .sort((a, b) => rankItem(b) - rankItem(a))
      .slice(0, MAX_ITEMS_PER_DAY),
  }))

  const days = allDays.filter((day) => day.items.length > 0)

  return {
    month: getMonthKey(weekStart),
    periodStart: toDateString(weekStart),
    periodEnd: toDateString(weekEnd),
    periodLabel: formatWeekLabel(weekStart, weekEnd),
    days,
    totalItems: days.reduce((sum, day) => sum + day.items.length, 0),
  }
}

export async function getCalendarWeek(
  anchorDate: Date,
  filter: CalendarFilter = "all",
): Promise<CalendarMonthData> {
  const weekStart = getWeekStart(anchorDate)
  const items = await fetchCalendarItems(weekStart)
  return buildCalendarWeek(weekStart, items, filter)
}

export function getWeekStartString(date: Date = new Date()): string {
  return toDateString(getWeekStart(date))
}

export function shiftWeek(weekStart: string, offset: number): string {
  const date = new Date(`${weekStart}T12:00:00`)
  date.setDate(date.getDate() + offset * 7)
  return toDateString(getWeekStart(date))
}

export { buildEpisodeLabel }
