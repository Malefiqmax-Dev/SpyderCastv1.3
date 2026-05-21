"use client"

import { useCallback, useEffect, useState } from "react"
import { Film, Tv, Play, Trash2, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AdminMoviesPanelProps {
  enabled: boolean
}

interface Movie {
  id: string
  tmdbId: number
  title: string
  year: number | null
  poster: string | null
  addedAt: string
  updatedAt: string
  sources: any[]
  _count: { sources: number }
}

interface Series {
  id: string
  tmdbId: number
  title: string
  seasonCount: number
  episodeCount: number
  updatedAt: string
  episodes: any[]
  _count: { episodes: number }
}

interface HLSMovie {
  id: string
  tmdbId: number
  title: string
  poster: string | null
  url: string
  type: string
  size: string | null
  updatedAt: string
}

export function AdminMoviesPanel({ enabled }: AdminMoviesPanelProps) {
  const [type, setType] = useState<"all" | "movie" | "series" | "hls">("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [hls, setHls] = useState<HLSMovie[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    if (!enabled) return
    setLoading(true)

    try {
      const params = new URLSearchParams({
        type,
        page: String(page),
        perPage: "20",
        ...(search.trim() ? { search: search.trim() } : {}),
      })

      const res = await fetch(`/api/admin/movies?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) throw new Error("fetch_failed")

      const data = await res.json()
      setMovies(data.movies || [])
      setSeries(data.series || [])
      setHls(data.hls || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      toast.error("Impossible de charger les films.")
    } finally {
      setLoading(false)
    }
  }, [enabled, type, page, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    setPage(1)
  }, [type, search])

  async function handleDelete(id: string, itemType: string) {
    if (!confirm(`Supprimer ce ${itemType === "movie" ? "film" : itemType === "series" ? "série" : "contenu HLS"} ?`)) return

    try {
      const res = await fetch("/api/admin/movies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: itemType }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Suppression impossible.")
        return
      }

      toast.success("Supprimé avec succès.")
      loadData()
    } catch {
      toast.error("Erreur lors de la suppression.")
    }
  }

  const filters = [
    { id: "all", label: "Tous", icon: Play },
    { id: "movie", label: "Films", icon: Film },
    { id: "series", label: "Séries", icon: Tv },
    { id: "hls", label: "HLS", icon: Play },
  ]

  return (
    <div className="admin-movies-panel">
      <div className="admin-movies-filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setType(filter.id as any)}
            className={`admin-movies-filter ${type === filter.id ? "admin-movies-filter-active" : ""}`}
          >
            <filter.icon className="admin-movies-filter-icon" />
            {filter.label}
          </button>
        ))}
      </div>

      <div className="admin-movies-search">
        <Search className="admin-movies-search-icon" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre..."
          className="admin-movies-search-input"
        />
      </div>

      {loading ? (
        <div className="admin-movies-loading">
          <Loader2 className="admin-movies-loader" />
        </div>
      ) : (
        <>
          <div className="admin-movies-list">
            {movies.map((movie) => (
              <div key={movie.id} className="admin-movies-card">
                <div className="admin-movies-card-header">
                  <div className="admin-movies-card-info">
                    <h3 className="admin-movies-card-title">{movie.title}</h3>
                    <p className="admin-movies-card-meta">TMDB ID: {movie.tmdbId} • {movie.year || "N/A"}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(movie.id, "movie")}
                    className="admin-movies-delete-btn"
                    title="Supprimer"
                  >
                    <Trash2 className="admin-movies-delete-icon" />
                  </button>
                </div>
                <div className="admin-movies-card-body">
                  <p>Sources: {movie._count.sources}</p>
                  <p>Ajouté le: {new Date(movie.addedAt).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            ))}

            {series.map((s) => (
              <div key={s.id} className="admin-movies-card">
                <div className="admin-movies-card-header">
                  <div className="admin-movies-card-info">
                    <h3 className="admin-movies-card-title">{s.title}</h3>
                    <p className="admin-movies-card-meta">TMDB ID: {s.tmdbId} • {s.seasonCount} saisons • {s.episodeCount} épisodes</p>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id, "series")}
                    className="admin-movies-delete-btn"
                    title="Supprimer"
                  >
                    <Trash2 className="admin-movies-delete-icon" />
                  </button>
                </div>
                <div className="admin-movies-card-body">
                  <p>Épisodes: {s._count.episodes}</p>
                  <p>Mis à jour le: {new Date(s.updatedAt).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            ))}

            {hls.map((h) => (
              <div key={h.id} className="admin-movies-card">
                <div className="admin-movies-card-header">
                  <div className="admin-movies-card-info">
                    <h3 className="admin-movies-card-title">{h.title}</h3>
                    <p className="admin-movies-card-meta">TMDB ID: {h.tmdbId} • Type: {h.type}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(h.id, "hls")}
                    className="admin-movies-delete-btn"
                    title="Supprimer"
                  >
                    <Trash2 className="admin-movies-delete-icon" />
                  </button>
                </div>
                <div className="admin-movies-card-body">
                  <p>Taille: {h.size || "N/A"}</p>
                  <p>Mis à jour le: {new Date(h.updatedAt).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            ))}

            {movies.length === 0 && series.length === 0 && hls.length === 0 && (
              <p className="admin-movies-empty">Aucun contenu trouvé.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="admin-movies-pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="admin-movies-page-btn"
              >
                <ChevronLeft className="admin-movies-page-icon" />
              </button>
              <span className="admin-movies-page-text">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="admin-movies-page-btn"
              >
                <ChevronRight className="admin-movies-page-icon" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
