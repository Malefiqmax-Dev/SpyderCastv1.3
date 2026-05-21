"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2, Trash2, Check, X, RotateCcw } from "lucide-react"
import { toast } from "sonner"

interface AdminDmcaPanelProps {
  enabled: boolean
}

interface DmcaReport {
  id: string
  name: string
  email: string
  workDescription: string
  contentUrl: string
  goodFaith: boolean
  accuracy: boolean
  signature: string
  status: string
  adminNote: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export function AdminDmcaPanel({ enabled }: AdminDmcaPanelProps) {
  const [reports, setReports] = useState<DmcaReport[]>([])
  const [status, setStatus] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })

  const loadReports = useCallback(async () => {
    if (!enabled) return
    setLoading(true)

    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: "10",
        status,
      })

      const res = await fetch(`/api/admin/dmca?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) throw new Error("fetch_failed")

      const data = await res.json()
      setReports(data.reports ?? [])
      setTotalPages(data.totalPages ?? 1)
      setStats(data.stats ?? { pending: 0, approved: 0, rejected: 0 })
    } catch {
      toast.error("Impossible de charger les signalements DMCA.")
    } finally {
      setLoading(false)
    }
  }, [enabled, page, status])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  useEffect(() => {
    setPage(1)
  }, [status])

  async function patchReport(id: string, nextStatus: string, adminNote?: string) {
    const res = await fetch("/api/admin/dmca", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus, adminNote }),
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Action impossible.")
      return
    }

    toast.success("Signalement mis à jour.")
    loadReports()
  }

  async function handleApprove(id: string) {
    const note = window.prompt("Note admin optionnelle (acceptation) :") ?? ""
    await patchReport(id, "approved", note || undefined)
  }

  async function handleReject(id: string) {
    const note = window.prompt("Raison du refus (optionnel) :") ?? ""
    await patchReport(id, "rejected", note || undefined)
  }

  async function handleReset(id: string) {
    await patchReport(id, "pending")
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce signalement ?")) return

    const res = await fetch("/api/admin/dmca", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || "Suppression impossible.")
      return
    }

    toast.success("Signalement supprimé.")
    loadReports()
  }

  const filters: { id: string; label: string; count?: number }[] = [
    { id: "pending", label: "En attente", count: stats.pending },
    { id: "approved", label: "Acceptés", count: stats.approved },
    { id: "rejected", label: "Refusés", count: stats.rejected },
    { id: "all", label: "Tous" },
  ]

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case "pending": return "status-badge-pending"
      case "approved": return "status-badge-approved"
      case "rejected": return "status-badge-rejected"
      default: return ""
    }
  }

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "pending": return "En attente"
      case "approved": return "Accepté"
      case "rejected": return "Refusé"
      default: return s
    }
  }

  return (
    <div className="admin-dmca-panel">
      <div className="admin-dmca-stats">
        <span>{stats.pending} en attente</span>
        <span>{stats.approved} acceptés</span>
        <span>{stats.rejected} refusés</span>
      </div>

      <div className="admin-dmca-filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatus(filter.id)}
            className={`admin-dmca-filter ${status === filter.id ? "admin-dmca-filter-active" : ""}`}
          >
            {filter.label}
            {filter.count !== undefined ? ` (${filter.count})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-dmca-loading">
          <Loader2 className="admin-dmca-loader" />
        </div>
      ) : (
        <>
          <div className="admin-dmca-list">
            {reports.map((report) => (
              <div key={report.id} className="admin-dmca-card">
                <div className="admin-dmca-card-header">
                  <div className="admin-dmca-card-info">
                    <h3 className="admin-dmca-card-name">{report.name}</h3>
                    <p className="admin-dmca-card-email">{report.email}</p>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                </div>

                <div className="admin-dmca-card-body">
                  <div className="admin-dmca-card-section">
                    <h4>Œuvre protégée :</h4>
                    <p>{report.workDescription}</p>
                  </div>

                  <div className="admin-dmca-card-section">
                    <h4>URL du contenu :</h4>
                    <a href={report.contentUrl} target="_blank" rel="noopener noreferrer" className="admin-dmca-link">
                      {report.contentUrl}
                    </a>
                  </div>

                  <div className="admin-dmca-card-section">
                    <h4>Déclarations :</h4>
                    <p>Bonne foi : {report.goodFaith ? "✓" : "✗"}</p>
                    <p>Exactitude : {report.accuracy ? "✓" : "✗"}</p>
                  </div>

                  <div className="admin-dmca-card-section">
                    <h4>Signature :</h4>
                    <p>{report.signature}</p>
                  </div>

                  {report.adminNote && (
                    <div className="admin-dmca-card-section admin-dmca-admin-note">
                      <h4>Note admin :</h4>
                      <p>{report.adminNote}</p>
                    </div>
                  )}

                  <div className="admin-dmca-card-footer">
                    <small>Envoyé le {new Date(report.createdAt).toLocaleString("fr-FR")}</small>
                    {report.reviewedAt && (
                      <small>• Traité le {new Date(report.reviewedAt).toLocaleString("fr-FR")}</small>
                    )}
                  </div>
                </div>

                <div className="admin-dmca-card-actions">
                  {report.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(report.id)}
                        className="admin-dmca-action-btn admin-dmca-action-approve"
                        title="Accepter"
                      >
                        <Check className="admin-dmca-action-icon" />
                      </button>
                      <button
                        onClick={() => handleReject(report.id)}
                        className="admin-dmca-action-btn admin-dmca-action-reject"
                        title="Refuser"
                      >
                        <X className="admin-dmca-action-icon" />
                      </button>
                    </>
                  )}
                  {report.status !== "pending" && (
                    <button
                      onClick={() => handleReset(report.id)}
                      className="admin-dmca-action-btn admin-dmca-action-reset"
                      title="Réinitialiser"
                    >
                      <RotateCcw className="admin-dmca-action-icon" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="admin-dmca-action-btn admin-dmca-action-delete"
                    title="Supprimer"
                  >
                    <Trash2 className="admin-dmca-action-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {reports.length === 0 && (
            <p className="admin-dmca-empty">Aucun signalement dans cette catégorie.</p>
          )}

          {totalPages > 1 && (
            <div className="admin-dmca-pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="admin-dmca-page-btn">
                <ChevronLeft className="admin-dmca-page-icon" />
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="admin-dmca-page-btn"
              >
                <ChevronRight className="admin-dmca-page-icon" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
