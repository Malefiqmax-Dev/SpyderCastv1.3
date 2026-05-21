"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Plus, Search, X } from "lucide-react"
import { searchMulti, getImageUrl } from "@/lib/tmdb"
import { useAuth } from "@/components/auth/auth-context"
import { toast } from "sonner"
import "./request-search-modal.css"

interface SearchResult {
  id: number
  media_type: "movie" | "tv"
  title?: string
  name?: string
  poster_path?: string | null
}

interface RequestSearchModalProps {
  open: boolean
  onClose: () => void
  onSubmitted: () => void
}

export function RequestSearchModal({ open, onClose, onSubmitted }: RequestSearchModalProps) {
  const { user } = useAuth()
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setMessage("")
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchMulti(query.trim())
        const filtered = (data.results ?? []).filter(
          (item: SearchResult) => item.media_type === "movie" || item.media_type === "tv",
        )
        setResults(filtered.slice(0, 12))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  async function submitRequest(item: SearchResult) {
    if (!user) {
      toast.error("Connectez-vous pour faire une demande.")
      return
    }

    setSubmitting(item.id)

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: item.media_type,
          title: item.title || item.name,
          posterPath: item.poster_path,
          message: message.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Demande impossible.")
        return
      }

      toast.success("Demande envoyee ! Votre vote a ete ajoute.")
      onSubmitted()
      onClose()
    } catch {
      toast.error("Erreur reseau.")
    } finally {
      setSubmitting(null)
    }
  }

  if (!open) return null

  return (
    <div className="request-modal-overlay">
      <div className="request-modal-shell">
        <div className="request-modal-header">
          <div>
            <h2 className="request-modal-title">Demander un contenu</h2>
            <p className="request-modal-subtitle">Recherchez un film ou une serie absent du catalogue</p>
          </div>
          <button type="button" onClick={onClose} className="request-modal-close" aria-label="Fermer">
            <X className="request-modal-close-icon" />
          </button>
        </div>

        <div className="request-modal-search-wrap">
          <Search className="request-modal-search-icon" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titre du film ou de la serie..."
            className="request-modal-search-input"
          />
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message optionnel (pourquoi vous voulez ce contenu...)"
          className="request-modal-message"
          rows={2}
        />

        <div className="request-modal-results">
          {loading && (
            <div className="request-modal-loading">
              <Loader2 className="request-modal-loader" />
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="request-modal-empty">Aucun resultat TMDB.</p>
          )}

          {!loading &&
            results.map((item) => {
              const imageUrl = getImageUrl(item.poster_path ?? null, "w185")
              const title = item.title || item.name || "Sans titre"

              return (
                <button
                  key={`${item.media_type}-${item.id}`}
                  type="button"
                  disabled={submitting === item.id}
                  onClick={() => submitRequest(item)}
                  className="request-modal-result"
                >
                  <div className="request-modal-result-poster">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={title} fill sizes="48px" className="request-modal-result-image" />
                    ) : (
                      <div className="request-modal-result-fallback" />
                    )}
                  </div>
                  <div className="request-modal-result-info">
                    <p className="request-modal-result-title">{title}</p>
                    <p className="request-modal-result-type">{item.media_type === "movie" ? "Film" : "Serie"}</p>
                  </div>
                  {submitting === item.id ? (
                    <Loader2 className="request-modal-result-action request-modal-loader" />
                  ) : (
                    <Plus className="request-modal-result-action" />
                  )}
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
