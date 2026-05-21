import { buildVidFastUrl } from "@/lib/vidfast"

export type PlayerSourceId = "eau" | "terre" | "feu" | "air" | "eclair"

export type PlayerSourceType = "native" | "vidfast" | "wavewatch"

export interface PlayerSource {
  id: PlayerSourceId
  label: string
  lang: "VF" | "VOSTFR" | "Multi"
  type: PlayerSourceType
  description: string
}

export const PLAYER_SOURCES: PlayerSource[] = [
  {
    id: "eau",
    label: "Eau",
    lang: "VF",
    type: "native",
    description: "Flux local haute qualité",
  },
  {
    id: "terre",
    label: "Terre",
    lang: "VF",
    type: "native",
    description: "Source locale alternative",
  },
  {
    id: "feu",
    label: "Feu",
    lang: "VOSTFR",
    type: "vidfast",
    description: "Lecteur externe VidFast",
  },
  {
    id: "air",
    label: "Air",
    lang: "VOSTFR",
    type: "native",
    description: "Flux local VOSTFR",
  },
  {
    id: "eclair",
    label: "Éclair",
    lang: "Multi",
    type: "wavewatch",
    description: "Lecteur externe WaveWatch",
  },
]

export function getPlayerSource(id: PlayerSourceId): PlayerSource {
  return PLAYER_SOURCES.find((source) => source.id === id) ?? PLAYER_SOURCES[0]
}

export function isExternalSource(source: PlayerSource): boolean {
  return source.type === "vidfast" || source.type === "wavewatch"
}

export function isNativeSource(source: PlayerSource): boolean {
  return source.type === "native"
}

export function buildWaveWatchUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  if (options.mediaType === "movie") {
    return `https://wwembed.wavewatch.top/api/v1/streaming/ww-movie-${options.tmdbId}`
  }

  return `https://wwembed.wavewatch.top/api/v1/streaming/ww-tv-${options.tmdbId}-s${seasonNum}-e${episodeNum}`
}

export function buildExternalSourceUrl(
  source: PlayerSource,
  options: {
    tmdbId: number
    mediaType: "movie" | "tv"
    season?: number
    episode?: number
  },
): string | null {
  if (source.type === "vidfast") {
    return buildVidFastUrl({
      tmdbId: options.tmdbId,
      mediaType: options.mediaType,
      season: options.season ?? 1,
      episode: options.episode ?? 1,
    })
  }

  if (source.type === "wavewatch") {
    return buildWaveWatchUrl(options)
  }

  return null
}
