const API_URL = process.env.INTERNAL_API_URL;
const API_KEY = process.env.INTERNAL_API_KEY;

export interface MovieSource {
  url: string;
  quality: string;
  language: string;
  size: string;
  size_bytes: number;
}

export interface MovieData {
  id: string;
  tmdb_id: number;
  title: string;
  year: number;
  poster: string;
  source: MovieSource;
  added_at: string;
}

export interface EpisodeData {
  season: string;
  episode_number: number;
  url: string;
  size: string;
  language: string;
}

export interface SeriesData {
  series_name: string;
  tmdb_id: number;
  season_count: number;
  episode_count: number;
  episodes: EpisodeData[];
}

export interface HLSSource {
  url: string;
  type: string;
  size: string;
  size_bytes: number;
}

export interface HLSMovieData {
  id: string;
  tmdb_id: number;
  title: string;
  poster: string;
  source: HLSSource;
}

export interface CatalogStats {
  total_movies: number;
  total_series: number;
  total_hls: number;
}

async function fetchInternal<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  if (!API_URL || !API_KEY) {
    throw new Error("Internal API configuration missing.");
  }

  const url = new URL(`${API_URL}${endpoint}`);
  url.searchParams.append("api_key", API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
    },
    next: { revalidate: 3600 } // Cache for 1 hour by default
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success && !result.data && !result.episodes && !result.series_name) {
    // Some endpoints might not have success: true but return data directly
    // but the user prompt says "success": true in Movie example.
  }

  return result;
}

export const mediaApi = {
  // Movies
  getMovies: (page = 1, perPage = 50) => 
    fetchInternal<{ success: boolean; data: MovieData[]; pagination: any }>("/movies", { page, per_page: perPage }),
  
  searchMovies: (q: string) => 
    fetchInternal<{ success: boolean; data: MovieData[] }>("/movies/search", { q }),
  
  getMovieByTmdb: (tmdbId: number) => 
    fetchInternal<MovieData>(`/movies/${tmdbId}`),

  // Series
  getSeries: (page = 1, perPage = 50) => 
    fetchInternal<{ success: boolean; data: SeriesData[]; pagination: any }>("/series", { page, per_page: perPage }),
  
  searchSeries: (q: string) => 
    fetchInternal<{ success: boolean; data: SeriesData[] }>("/series/search", { q }),
  
  getSeriesByTmdb: (tmdbId: number) => 
    fetchInternal<SeriesData>(`/series/${tmdbId}`),

  // HLS
  getHLSMovies: (page = 1, perPage = 50) => 
    fetchInternal<{ success: boolean; data: HLSMovieData[]; pagination: any }>("/hls", { page, per_page: perPage }),
  
  searchHLS: (q: string) => 
    fetchInternal<{ success: boolean; data: HLSMovieData[] }>("/hls/search", { q }),
  
  getHLSByTmdb: (tmdbId: number) => 
    fetchInternal<HLSMovieData>(`/hls/${tmdbId}`),
  
  getHLSPlayer: (embedId: string) => 
    fetchInternal<{ url: string }>(`/hls/${embedId}/player`),

  // Catalog
  getCatalogStats: () => 
    fetchInternal<CatalogStats>("/catalog"),
};
