"use client"

import { useCallback, useEffect, useState } from "react"
import { Footer } from "@/components/layout/footer"
import { RequestCard } from "@/components/requests/request-card"
import { RequestSearchModal } from "@/components/requests/request-search-modal"
import { useAuth } from "@/components/auth/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import type { RequestListItem, RequestSort } from "@/lib/content-requests"
import { ChevronLeft, ChevronRight, Loader2, MessageSquarePlus, ThumbsUp, User, Vote } from "lucide-react"
import { toast } from "sonner"
import "./requests.css"

type ViewTab = "popular" | "recent" | "voted" | "mine"

const TABS: { id: ViewTab; label: string; icon: typeof Vote }[] = [
  { id: "popular", label: "Populaires", icon: ThumbsUp },
  { id: "recent", label: "Recentes", icon: Vote },
  { id: "voted", label: "Mes votes", icon: ThumbsUp },
  { id: "mine", label: "Mes demandes", icon: User },
]

export default function RequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestListItem[]>([])
  const [tab, setTab] = useState<ViewTab>("popular")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: "12",
        sort: tab === "recent" ? "recent" : "votes",
      })

      if (tab === "mine") params.set("mine", "1")
      if (tab === "voted") params.set("voted", "1")

      const res = await fetch(`/api/requests?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "fetch_failed")
      }

      const data = await res.json()
      setRequests(data.requests ?? [])
      setTotalPages(data.totalPages ?? 1)
      setPendingCount(data.pendingCount ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les demandes.")
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [page, tab])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  useEffect(() => {
    setPage(1)
  }, [tab])

  async function handleVote(id: string) {
    if (!user) {
      setAuthOpen(true)
      return
    }

    setVotingId(id)

    try {
      const res = await fetch(`/api/requests/${id}/vote`, { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Vote impossible.")
        return
      }

      setRequests((prev) => prev.map((item) => (item.id === id ? data.request : item)))
    } catch {
      toast.error("Erreur reseau.")
    } finally {
      setVotingId(null)
    }
  }

  function openRequestModal() {
    if (!user) {
      setAuthOpen(true)
      return
    }
    setModalOpen(true)
  }

  return (
    <main className="requests-main">
      <div className="requests-wrapper">
        <div className="requests-header">
          <div className="requests-header-row">
            <div className="requests-header-icon-wrap">
              <MessageSquarePlus className="requests-header-icon" />
            </div>
            <div className="requests-header-text">
              <h1 className="requests-title">Demandes d&apos;ajout</h1>
              <p className="requests-subtitle">
                Proposez un film ou une serie manquant, votez pour les demandes des autres — {pendingCount} en attente
              </p>
            </div>
          </div>
          <button type="button" onClick={openRequestModal} className="requests-new-btn">
            <MessageSquarePlus className="requests-new-btn-icon" />
            Nouvelle demande
          </button>
        </div>

        <div className="requests-tabs">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`requests-tab ${tab === item.id ? "requests-tab-active" : "requests-tab-inactive"}`}
            >
              <item.icon className="requests-tab-icon" />
              {item.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="requests-loading">
            <Loader2 className="requests-loader" />
            <p>Chargement des demandes...</p>
          </div>
        )}

        {error && !loading && <div className="requests-error">{error}</div>}

        {!loading && !error && requests.length === 0 && (
          <div className="requests-empty">
            <p>Aucune demande pour le moment.</p>
            <button type="button" onClick={openRequestModal} className="requests-empty-btn">
              Faire la premiere demande
            </button>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <>
            <div className="requests-list">
              {requests.map((item) => (
                <RequestCard
                  key={item.id}
                  item={item}
                  voting={votingId === item.id}
                  onVote={handleVote}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="requests-pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="requests-page-btn"
                >
                  <ChevronLeft className="requests-page-icon" />
                </button>
                <span className="requests-page-text">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="requests-page-btn"
                >
                  <ChevronRight className="requests-page-icon" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <RequestSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={loadRequests}
      />

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <Footer />
    </main>
  )
}
