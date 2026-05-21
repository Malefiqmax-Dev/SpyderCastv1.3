"use client"

import { useCallback, useEffect, useState } from "react"
import { RequestCard } from "@/components/requests/request-card"
import type { RequestListItem, RequestStatus } from "@/lib/content-requests"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AdminRequestsPanelProps {
  enabled: boolean
}

export function AdminRequestsPanel({ enabled }: AdminRequestsPanelProps) {
  const [requests, setRequests] = useState<RequestListItem[]>([])
  const [status, setStatus] = useState<RequestStatus | "all">("pending")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })

  const loadRequests = useCallback(async () => {
    if (!enabled) return
    setLoading(true)

    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: "10",
        status,
      })

      const res = await fetch(`/api/admin/requests?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) throw new Error("fetch_failed")

      const data = await res.json()
      setRequests(data.requests ?? [])
      setTotalPages(data.totalPages ?? 1)
      setStats(data.stats ?? { pending: 0, approved: 0, rejected: 0 })
    } catch {
      toast.error("Impossible de charger les demandes.")
    } finally {
      setLoading(false)
    }
  }, [enabled, page, status])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  useEffect(() => {
    setPage(1)
  }, [status])

  async function patchRequest(id: string, nextStatus: RequestStatus, adminNote?: string) {
    const res = await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus, adminNote }),
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Action impossible.")
      return
    }

    toast.success("Demande mise a jour.")
    loadRequests()
  }

  async function handleApprove(id: string) {
    const note = window.prompt("Note admin optionnelle (acceptation) :") ?? ""
    await patchRequest(id, "approved", note || undefined)
  }

  async function handleReject(id: string) {
    const note = window.prompt("Raison du refus (optionnel) :") ?? ""
    await patchRequest(id, "rejected", note || undefined)
  }

  async function handleReset(id: string) {
    await patchRequest(id, "pending")
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette demande ?")) return

    const res = await fetch("/api/admin/requests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || "Suppression impossible.")
      return
    }

    toast.success("Demande supprimee.")
    loadRequests()
  }

  const filters: { id: RequestStatus | "all"; label: string; count?: number }[] = [
    { id: "pending", label: "En attente", count: stats.pending },
    { id: "approved", label: "Acceptees", count: stats.approved },
    { id: "rejected", label: "Refusees", count: stats.rejected },
    { id: "all", label: "Toutes" },
  ]

  return (
    <div className="admin-requests-panel">
      <div className="admin-requests-stats">
        <span>{stats.pending} en attente</span>
        <span>{stats.approved} acceptees</span>
        <span>{stats.rejected} refusees</span>
      </div>

      <div className="admin-requests-filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatus(filter.id)}
            className={`admin-requests-filter ${status === filter.id ? "admin-requests-filter-active" : ""}`}
          >
            {filter.label}
            {filter.count !== undefined ? ` (${filter.count})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-requests-loading">
          <Loader2 className="admin-requests-loader" />
        </div>
      ) : (
        <>
          <div className="admin-requests-list">
            {requests.map((item) => (
              <RequestCard
                key={item.id}
                item={item}
                showAdminActions
                onApprove={handleApprove}
                onReject={handleReject}
                onReset={handleReset}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {requests.length === 0 && (
            <p className="admin-requests-empty">Aucune demande dans cette categorie.</p>
          )}

          {totalPages > 1 && (
            <div className="admin-requests-pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="admin-requests-page-btn">
                <ChevronLeft className="admin-requests-page-icon" />
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="admin-requests-page-btn"
              >
                <ChevronRight className="admin-requests-page-icon" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
