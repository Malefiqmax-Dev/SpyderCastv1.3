import { buildVidFastUrl } from "@/lib/vidfast"

export type PlayerSourceId = "eau" | "terre" | "feu" | "eclair" | "peachify" | "anyembed" | "vidsrcwtf" | "nontongo" | "videasy" | "oneembed" | "vidking" | "twoembed" | "superflix" | "dcp"

export type PlayerSourceType = "native" | "vidfast" | "wavewatch" | "frembed" | "peachify" | "anyembed" | "vidsrcwtf" | "nontongo" | "videasy" | "oneembed" | "vidking" | "twoembed" | "superflix" | "peachifyvf"

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
    label: "VF 1",
    lang: "VF",
    type: "native",
    description: "Flux haute qualité (Local + FastFlux)",
  },
  {
    id: "terre",
    label: "VF 2",
    lang: "VF",
    type: "frembed",
    description: "Lecteur externe Frembed",
  },
  {
    id: "dcp",
    label: "VF 3",
    lang: "VF",
    type: "peachifyvf",
    description: "Lecteur externe Peachify (serveur français)",
  },
  {
    id: "feu",
    label: "VOSTFR 1",
    lang: "VOSTFR",
    type: "vidfast",
    description: "Lecteur externe VidFast",
  },
  {
    id: "eclair",
    label: "MULTI 1",
    lang: "Multi",
    type: "wavewatch",
    description: "Lecteur externe WaveWatch",
  },
  {
    id: "peachify",
    label: "VOSTFR 2",
    lang: "VOSTFR",
    type: "peachify",
    description: "Lecteur externe Peachify (VO sous-titrés français)",
  },
  {
    id: "anyembed",
    label: "MULTI 2",
    lang: "Multi",
    type: "anyembed",
    description: "Lecteur externe AnyEmbed (multi-langue)",
  },
  {
    id: "vidsrcwtf",
    label: "MULTI 3",
    lang: "Multi",
    type: "vidsrcwtf",
    description: "Lecteur externe VidSrc.wtf (multi-langue)",
  },
  {
    id: "nontongo",
    label: "MULTI 4",
    lang: "Multi",
    type: "nontongo",
    description: "Lecteur externe NontonGo (multi-langue)",
  },
  {
    id: "videasy",
    label: "MULTI 5",
    lang: "Multi",
    type: "videasy",
    description: "Lecteur externe Videasy (multi-langue)",
  },
  {
    id: "oneembed",
    label: "MULTI 6",
    lang: "Multi",
    type: "oneembed",
    description: "Lecteur externe 1Embed (multi-langue)",
  },
  {
    id: "vidking",
    label: "MULTI 7",
    lang: "Multi",
    type: "vidking",
    description: "Lecteur externe Vidking (multi-langue)",
  },
  {
    id: "twoembed",
    label: "MULTI 8",
    lang: "Multi",
    type: "twoembed",
    description: "Lecteur externe 2Embed (multi-langue)",
  },
  {
    id: "superflix",
    label: "MULTI 9",
    lang: "Multi",
    type: "superflix",
    description: "Lecteur externe Superflix (multi-langue)",
  },
]

export function getPlayerSource(id: PlayerSourceId): PlayerSource {
  return PLAYER_SOURCES.find((source) => source.id === id) ?? PLAYER_SOURCES[0]
}

export function isExternalSource(source: PlayerSource): boolean {
  return source.type === "vidfast" || source.type === "wavewatch" || source.type === "frembed" || 
         source.type === "peachify" || source.type === "peachifyvf" || source.type === "anyembed" || source.type === "vidsrcwtf" || 
         source.type === "nontongo" || source.type === "videasy" || 
         source.type === "oneembed" || source.type === "vidking" || source.type === "twoembed"
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

export function buildFrembedUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  if (options.mediaType === "movie") {
    return `https://frembed.click/embed/movie/${options.tmdbId}`
  }

  return `https://frembed.click/embed/serie/${options.tmdbId}?sa=${seasonNum}&epi=${episodeNum}`
}

export function buildPeachifyUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  if (options.mediaType === "movie") {
    return `https://peachify.top/embed/movie/${options.tmdbId}?sub=fr`
  }

  return `https://peachify.top/embed/tv/${options.tmdbId}/${seasonNum}/${episodeNum}?sub=fr`
}

export function buildPeachifyVfUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  if (options.mediaType === "movie") {
    return `https://peachify.top/embed/movie/${options.tmdbId}?dub=French`
  }

  return `https://peachify.top/embed/tv/${options.tmdbId}/${seasonNum}/${episodeNum}?dub=French`
}

export function buildAnyembedUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  if (options.mediaType === "movie") {
    return `https://anyembed.xyz/embed/tmdb-movie-${options.tmdbId}`
  }

  return `https://anyembed.xyz/embed/tmdb-tv-${options.tmdbId}-${seasonNum}-${episodeNum}`
}

export function buildVidsrcwtfUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  // Using API 2 (Multi Language) from vidsrc.wtf
  if (options.mediaType === "movie") {
    return `https://vidsrc.wtf/2/movie/${options.tmdbId}?color=FFB300`
  }

  return `https://vidsrc.wtf/2/tv/${options.tmdbId}/${seasonNum}/${episodeNum}?color=FFB300`
}

export function buildNontongoUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  if (options.mediaType === "movie") {
    return `https://www.nontongo.win/embed/movie/${options.tmdbId}`
  }

  return `https://www.nontongo.win/embed/tv/?id=${options.tmdbId}&s=${seasonNum}&e=${episodeNum}`
}

export function buildVideasyUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  // Using official player.videasy.net pattern from documentation
  if (options.mediaType === "movie") {
    return `https://player.videasy.net/movie/${options.tmdbId}`
  }

  return `https://player.videasy.net/tv/${options.tmdbId}/${seasonNum}/${episodeNum}`
}

export function buildOneembedUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  if (options.mediaType === "movie") {
    return `https://1embed.cc/embed/movie/${options.tmdbId}`
  }

  return `https://1embed.cc/embed/tv/${options.tmdbId}/${seasonNum}/${episodeNum}`
}

export function buildVidkingUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  if (options.mediaType === "movie") {
    return `https://www.vidking.net/embed/movie/${options.tmdbId}`
  }

  return `https://www.vidking.net/embed/tv/${options.tmdbId}/${seasonNum}/${episodeNum}`
}

export function buildTwoembedUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  const seasonNum = options.season ?? 1
  const episodeNum = options.episode ?? 1

  if (options.mediaType === "movie") {
    return `https://www.2embed.cc/embed/${options.tmdbId}`
  }

  return `https://www.2embed.cc/embedtv/${options.tmdbId}&s=${seasonNum}&e=${episodeNum}`
}

export function buildSuperflixUrl(options: {
  tmdbId: number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
}): string {
  if (options.mediaType === "movie") {
    return `https://superflixapi.best/filme/${options.tmdbId}`
  }

  return `https://superflixapi.best/serie/${options.tmdbId}`
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

  if (source.type === "frembed") {
    return buildFrembedUrl(options)
  }

  if (source.type === "peachify") {
    return buildPeachifyUrl(options)
  }

  if (source.type === "peachifyvf") {
    return buildPeachifyVfUrl(options)
  }

  if (source.type === "anyembed") {
    return buildAnyembedUrl(options)
  }

  if (source.type === "vidsrcwtf") {
    return buildVidsrcwtfUrl(options)
  }

  if (source.type === "nontongo") {
    return buildNontongoUrl(options)
  }

  if (source.type === "videasy") {
    return buildVideasyUrl(options)
  }

  if (source.type === "oneembed") {
    return buildOneembedUrl(options)
  }

  if (source.type === "vidking") {
    return buildVidkingUrl(options)
  }

  if (source.type === "twoembed") {
    return buildTwoembedUrl(options)
  }

  if (source.type === "superflix") {
    return buildSuperflixUrl(options)
  }

  return null
}
