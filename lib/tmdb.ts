const TMDB_TOKEN = process.env.TMDB_API_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4YTAxNWFmZjM3ZjM5ODY5NzM5ODk3YWUzZGNlZmU5MiIsIm5iZiI6MTc3MDg0MjcxNi45ODgsInN1YiI6IjY5OGNlYTVjNDFjOTYwZGNjZmIzMGYwOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.rq0-m_bJcToSKDOJpaL0U0L3xfLfNut9zD5rCm2clak"
const BASE_URL = "https://api.themoviedb.org/3"

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set("language", "fr-FR")
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  
  console.log("TMDB Request URL:", url.toString());

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        "Content-Type": "application/json;charset=utf-8",
      },
      next: { revalidate: 3600 },
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error(`TMDB fetch failed for ${endpoint}:`, error)
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function getTrending(mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week") {
  return tmdbFetch(`/trending/${mediaType}/${timeWindow}`)
}

export async function getPopularMovies(page = 1) {
  return tmdbFetch("/movie/popular", { page: String(page) })
}

export async function fetchAllMovies(pages = 3) {
  const fetchers = Array.from({ length: pages }, (_, i) => getPopularMovies(i + 1));
  const results = await Promise.allSettled(fetchers);
  
  const movieMap = new Map();
  
  results.forEach((res) => {
    if (res.status === "fulfilled") {
      res.value.results.forEach((movie: any) => {
        if (!movieMap.has(movie.id)) {
          movieMap.set(movie.id, movie);
        }
      });
    }
  });
  
  return Array.from(movieMap.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export async function getTopRatedMovies(page = 1) {
  return tmdbFetch("/movie/top_rated", { page: String(page) })
}

export async function getNowPlayingMovies(page = 1) {
  return tmdbFetch("/movie/now_playing", { page: String(page), region: "FR" })
}

export async function getUpcomingMovies(page = 1) {
  return tmdbFetch("/movie/upcoming", { page: String(page), region: "FR" })
}

export async function getOnTheAirTV(page = 1) {
  return tmdbFetch("/tv/on_the_air", { page: String(page) })
}

export async function getAiringTodayTV(page = 1) {
  return tmdbFetch("/tv/airing_today", { page: String(page) })
}

export async function getTVCalendarDetails(id: number) {
  return tmdbFetch(`/tv/${id}`)
}

export async function discoverMoviesByDateRange(gte: string, lte: string, page = 1) {
  return tmdbFetch("/discover/movie", {
    "primary_release_date.gte": gte,
    "primary_release_date.lte": lte,
    sort_by: "popularity.desc",
    page: String(page),
    region: "FR",
    "vote_count.gte": "20",
    "vote_average.gte": "5.0",
  })
}

export async function discoverTVByDateRange(gte: string, lte: string, page = 1) {
  return tmdbFetch("/discover/tv", {
    "first_air_date.gte": gte,
    "first_air_date.lte": lte,
    sort_by: "popularity.desc",
    page: String(page),
    "vote_count.gte": "20",
    "vote_average.gte": "5.0",
  })
}

export async function getPopularTV(page = 1) {
  return tmdbFetch("/tv/popular", { page: String(page) })
}

export async function getTopRatedTV(page = 1) {
  return tmdbFetch("/tv/top_rated", { page: String(page) })
}

export async function getMovieDetails(id: number) {
  return tmdbFetch(`/movie/${id}`, { append_to_response: "credits,similar,videos" })
}

export async function getTVDetails(id: number) {
  return tmdbFetch(`/tv/${id}`, { append_to_response: "credits,similar,videos" })
}

export async function getMovieTrailer(id: number) {
  const details = await getMovieDetails(id)
  const trailer = details.videos?.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube")
  return trailer?.key || null
}

export async function getTVTrailer(id: number) {
  const details = await getTVDetails(id)
  const trailer = details.videos?.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube")
  return trailer?.key || null
}

export async function getTVSeasonDetails(tvId: number, seasonNumber: number) {
  return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`)
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch("/search/multi", { query, page: String(page) })
}

export async function getMediaLogos(type: "movie" | "tv", id: number) {
  try {
    const data = await tmdbFetch(`/${type}/${id}/images`, { include_image_language: "fr,en,null" })
    return data.logos || []
  } catch (error) {
    console.error(`Error fetching logos for ${type} ${id}:`, error)
    return []
  }
}

export async function getMovieGenres() {
  return tmdbFetch("/genre/movie/list")
}

export async function getTVGenres() {
  return tmdbFetch("/genre/tv/list")
}

export async function discoverByNetwork(networkId: number, page = 1) {
  return tmdbFetch("/discover/tv", { with_networks: String(networkId), page: String(page), sort_by: "name.asc" })
}

export async function discoverMoviesByCompany(companyId: number, page = 1) {
  return tmdbFetch("/discover/movie", { with_companies: String(companyId), page: String(page), sort_by: "title.asc" })
}

export async function discoverByGenre(type: "movie" | "tv", genreId: number, page = 1) {
  return tmdbFetch(`/discover/${type}`, {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    page: String(page),
  })
}

export function getImageUrl(path: string | null, size = "w500") {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export function getBackdropUrl(path: string | null) {
  return getImageUrl(path, "original")
}

export async function discoverMoviesByProvider(providerId: number, page = 1) {
  return tmdbFetch("/discover/movie", {
    with_watch_providers: String(providerId),
    sort_by: "popularity.desc",
    page: String(page),
  })
}

export async function discoverTVByProvider(providerId: number, page = 1) {
  return tmdbFetch("/discover/tv", {
    with_watch_providers: String(providerId),
    sort_by: "popularity.desc",
    page: String(page),
  })
}

export const STREAMING_PROVIDERS = [
  { id: 8, name: "Netflix", slug: "netflix", color: "#E50914" },
  { id: 337, name: "Disney+", slug: "disney-plus", color: "#113CCF" },
  { id: 1899, name: "Max", slug: "max", color: "#002BE7" },
  { id: 119, name: "Prime Video", slug: "prime-video", color: "#00A8E1" },
  { id: 350, name: "Apple TV+", slug: "apple-tv-plus", color: "#000000" },
  { id: 531, name: "Paramount+", slug: "paramount-plus", color: "#0064FF" },
  { id: 381, name: "Canal+", slug: "canal-plus", color: "#1A1A1A" },
  { id: 283, name: "Crunchyroll", slug: "crunchyroll", color: "#F47521" },
] as const

export function getProviderBySlug(slug: string) {
  return STREAMING_PROVIDERS.find((p) => p.slug === slug)
}
