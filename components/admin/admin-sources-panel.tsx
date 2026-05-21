"use client"

import { useCallback, useEffect, useState } from "react"
import { Link, Trash2, Plus, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react"
import { toast } from "sonner"

interface AdminSourcesPanelProps {
  enabled: boolean
}

interface Source {
  id: string
  movieId: string
  url: string
  quality: string | null
  language: string | null
  size: string | null
  sizeBytes: bigint | null
  createdAt: string
  movie: {
    id: string
    title: string
    tmdbId: number
  }
}

export function AdminSourcesPanel({ enabled }: AdminSourcesPanelProps) {
  const [sources, setSources] = useState<Source[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    movieId: "",
    url: "",
    quality: "",
    language: "",
    size: "",
  })

  const loadSources = useCallback(async () => {
    if (!enabled) return
    setLoading(true)

    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: "20",
      })

      const res = await fetch(`/api/admin/sources?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) throw new Error("fetch_failed")

      const data = await res.json()
      setSources(data.sources || [])
      setTotalPages(data.totalPages || 1)
    } catch {
      toast.error("Impossible de charger les sources.")
    } finally {
      setLoading(false)
    }
  }, [enabled, page])

  useEffect(() => {
    loadSources()
  }, [loadSources])

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette source ?")) return

    try {
      const res = await fetch("/api/admin/sources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Suppression impossible.")
        return
      }

      toast.success("Source supprimée.")
      loadSources()
    } catch {
      toast.error("Erreur lors de la suppression.")
    }
  }

  async function handleAddSource(e: React.FormEvent) {
    e.preventDefault()

    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: formData.movieId,
          url: formData.url,
          quality: formData.quality || null,
          language: formData.language || null,
          size: formData.size || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Ajout impossible.")
        return
      }

      toast.success("Source ajoutée.")
      setFormData({ movieId: "", url: "", quality: "", language: "", size: "" })
      setShowAddForm(false)
      loadSources()
    } catch {
      toast.error("Erreur lors de l'ajout.")
    }
  }

  return (
    <div className="admin-sources-panel">
      <div className="admin-sources-header">
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="admin-sources-add-btn"
        >
          <Plus className="admin-sources-add-icon" />
          Ajouter une source
        </button>
      </div>

      {showAddForm && (
        <div className="admin-sources-form-card">
          <h3 className="admin-sources-form-title">Ajouter une source</h3>
          <form onSubmit={handleAddSource} className="admin-sources-form">
            <div className="admin-sources-form-group">
              <label className="admin-sources-form-label">ID du film *</label>
              <input
                type="text"
                required
                value={formData.movieId}
                onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                className="admin-sources-form-input"
                placeholder="mov_xxx"
              />
            </div>

            <div className="admin-sources-form-group">
              <label className="admin-sources-form-label">URL *</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="admin-sources-form-input"
                placeholder="https://..."
              />
            </div>

            <div className="admin-sources-form-group">
              <label className="admin-sources-form-label">Qualité</label>
              <input
                type="text"
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className="admin-sources-form-input"
                placeholder="1080p, 720p..."
              />
            </div>

            <div className="admin-sources-form-group">
              <label className="admin-sources-form-label">Langue</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="admin-sources-form-input"
                placeholder="FR, EN, VOSTFR..."
              />
            </div>

            <div className="admin-sources-form-group">
              <label className="admin-sources-form-label">Taille</label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="admin-sources-form-input"
                placeholder="1.5 GB"
              />
            </div>

            <div className="admin-sources-form-actions">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="admin-sources-cancel-btn"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="admin-sources-submit-btn"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="admin-sources-loading">
          <Loader2 className="admin-sources-loader" />
        </div>
      ) : (
        <>
          <div className="admin-sources-list">
            {sources.map((source) => (
              <div key={source.id} className="admin-sources-card">
                <div className="admin-sources-card-header">
                  <div className="admin-sources-card-info">
                    <h3 className="admin-sources-card-title">{source.movie.title}</h3>
                    <p className="admin-sources-card-meta">TMDB ID: {source.movie.tmdbId}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="admin-sources-delete-btn"
                    title="Supprimer"
                  >
                    <Trash2 className="admin-sources-delete-icon" />
                  </button>
                </div>

                <div className="admin-sources-card-body">
                  <div className="admin-sources-card-row">
                    <span className="admin-sources-card-label">URL:</span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-sources-card-link"
                    >
                      {source.url.substring(0, 50)}...
                    </a>
                  </div>

                  {source.quality && (
                    <div className="admin-sources-card-row">
                      <span className="admin-sources-card-label">Qualité:</span>
                      <span>{source.quality}</span>
                    </div>
                  )}

                  {source.language && (
                    <div className="admin-sources-card-row">
                      <span className="admin-sources-card-label">Langue:</span>
                      <span>{source.language}</span>
                    </div>
                  )}

                  {source.size && (
                    <div className="admin-sources-card-row">
                      <span className="admin-sources-card-label">Taille:</span>
                      <span>{source.size}</span>
                    </div>
                  )}

                  <div className="admin-sources-card-row">
                    <span className="admin-sources-card-label">Ajouté le:</span>
                    <span>{new Date(source.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              </div>
            ))}

            {sources.length === 0 && (
              <p className="admin-sources-empty">Aucune source trouvée.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="admin-sources-pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="admin-sources-page-btn"
              >
                <ChevronLeft className="admin-sources-page-icon" />
              </button>
              <span className="admin-sources-page-text">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="admin-sources-page-btn"
              >
                <ChevronRight className="admin-sources-page-icon" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
