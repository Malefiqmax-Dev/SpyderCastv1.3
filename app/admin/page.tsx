"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import {
  Users,
  Activity,
  ShieldCheck,
  Loader2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Database,
  MessageSquarePlus,
  ShieldAlert,
  Film,
  Link as LinkIcon,
  Key,
} from "lucide-react"
import { AdminRequestsPanel } from "@/components/admin/admin-requests-panel"
import { AdminDmcaPanel } from "@/components/admin/admin-dmca-panel"
import { AdminMoviesPanel } from "@/components/admin/admin-movies-panel"
import { AdminSourcesPanel } from "@/components/admin/admin-sources-panel"
import { AdminApisPanel } from "@/components/admin/admin-apis-panel"
import styles from "./page.module.css"
import "../requests/requests.css"

interface StatsData {
  totalUsers: number
  onlineNow: number
  lastHour: number
  last24h: number
  totalMovies: number
  totalSeries: number
  totalHls: number
  totalViews: number
  topMovies: any[]
  tmdb: { ok: boolean; ms: number }
  database: { ok: boolean }
}

interface UserData {
  id: string
  username: string
  email: string
  role: string
  nameColor: string
  createdAt: string
  lastSeen: string
  isOwner?: boolean
}

export default function AdminPage() {
  const { user, isOwner, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [adminTab, setAdminTab] = useState<"users" | "requests" | "dmca" | "movies" | "sources" | "apis">("users")

  useEffect(() => {
    if (!isLoading && !isOwner) {
      router.replace("/")
    }
  }, [isLoading, isOwner, router])

  const loadData = useCallback(async () => {
    if (!isOwner) return
    setLoadingData(true)
    setError(null)

    try {
      const query = new URLSearchParams({
        page: String(page),
        perPage: "20",
        ...(search.trim() ? { search: search.trim() } : {}),
      })

      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch(`/api/admin/users?${query.toString()}`, { cache: "no-store" }),
      ])

      if (!statsRes.ok || !usersRes.ok) {
        setError("Acces refuse ou session expiree.")
        return
      }

      const [statsData, usersData] = await Promise.all([statsRes.json(), usersRes.json()])
      setStats(statsData)
      setUsers(usersData.users ?? [])
      setTotalPages(usersData.totalPages ?? 1)
    } catch {
      setError("Impossible de charger les donnees admin.")
    } finally {
      setLoadingData(false)
    }
  }, [isOwner, page, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [loadData, search])

  async function handleDeleteUser(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return

    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || "Suppression impossible.")
      return
    }

    setUsers((prev) => prev.filter((u) => u.id !== id))
    loadData()
  }

  if (isLoading || !isOwner) {
    return (
      <main className={styles.loadingMain}>
        <Loader2 className={styles.loader} />
      </main>
    )
  }

  const statCards = stats
    ? [
        { label: "Utilisateurs", value: stats.totalUsers, icon: Users, iconClass: styles.statIconBlue },
        { label: "En ligne (5 min)", value: stats.onlineNow, icon: Activity, iconClass: styles.statIconAmber },
        { label: "Actifs (24h)", value: stats.last24h, icon: Wifi, iconClass: styles.statIconGreen },
        { label: "Films", value: stats.totalMovies, icon: Film, iconClass: styles.statIconPurple },
        { label: "Séries", value: stats.totalSeries, icon: Film, iconClass: styles.statIconPink },
        { label: "Vues totales", value: stats.totalViews, icon: Activity, iconClass: styles.statIconCyan },
      ]
    : []

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <div className={styles.iconWrap}>
              <ShieldCheck className={styles.headerIcon} />
            </div>
            <h1 className={styles.title}>Administration</h1>
          </div>
          <p className={styles.subtitle}>Panneau securise — acces proprietaire uniquement</p>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}

        <div className="admin-tab-bar">
          <button
            type="button"
            onClick={() => setAdminTab("users")}
            className={`admin-tab-btn ${adminTab === "users" ? "admin-tab-btn-active" : ""}`}
          >
            <Users className="requests-tab-icon" />
            Utilisateurs
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("movies")}
            className={`admin-tab-btn ${adminTab === "movies" ? "admin-tab-btn-active" : ""}`}
          >
            <Film className="requests-tab-icon" />
            Films
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("sources")}
            className={`admin-tab-btn ${adminTab === "sources" ? "admin-tab-btn-active" : ""}`}
          >
            <LinkIcon className="requests-tab-icon" />
            Sources
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("apis")}
            className={`admin-tab-btn ${adminTab === "apis" ? "admin-tab-btn-active" : ""}`}
          >
            <Key className="requests-tab-icon" />
            APIs
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("requests")}
            className={`admin-tab-btn ${adminTab === "requests" ? "admin-tab-btn-active" : ""}`}
          >
            <MessageSquarePlus className="requests-tab-icon" />
            Demandes
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("dmca")}
            className={`admin-tab-btn ${adminTab === "dmca" ? "admin-tab-btn-active" : ""}`}
          >
            <ShieldAlert className="requests-tab-icon" />
            Signalements DMCA
          </button>
        </div>

        {stats && adminTab === "users" && (
          <>
            <div className={styles.statsGrid}>
              {statCards.map((stat) => (
                <div key={stat.label} className={styles.statCard}>
                  <div className={`${styles.statIconWrap} ${stat.iconClass}`}>
                    <stat.icon className={styles.statIcon} />
                  </div>
                  <div>
                    <p className={styles.statValue}>{stat.value}</p>
                    <p className={styles.statLabel}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.healthGrid}>
              <div className={styles.healthCard}>
                <Database className={styles.healthIcon} />
                <span>Base de donnees {stats.database.ok ? "OK" : "KO"}</span>
              </div>
              <div className={styles.healthCard}>
                <Activity className={styles.healthIcon} />
                <span>TMDB {stats.tmdb.ok ? `OK (${stats.tmdb.ms}ms)` : "Indisponible"}</span>
              </div>
              <div className={styles.healthCard}>
                <Users className={styles.healthIcon} />
                <span>{stats.lastHour} actifs sur la derniere heure</span>
              </div>
            </div>
          </>
        )}

        {adminTab === "users" && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Utilisateurs</h2>
            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setPage(1)
                  setSearch(e.target.value)
                }}
                placeholder="Rechercher par email ou pseudo..."
                className={styles.searchInput}
              />
            </div>
          </div>

          {loadingData ? (
            <div className={styles.tableLoading}>
              <Loader2 className={styles.tableLoader} />
            </div>
          ) : (
            <>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.tableHeadRow}>
                      {["Utilisateur", "Email", "Role", "Inscrit le", "Derniere activite", "Actions"].map(
                        (col) => (
                          <th key={col} className={styles.tableHeadCell}>
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {users.map((u) => (
                      <tr key={u.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          <p className={styles.username} style={{ color: u.nameColor }}>
                            {u.username}
                          </p>
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellMuted}`}>{u.email}</td>
                        <td className={styles.tableCell}>
                          <span
                            className={`${styles.roleBadge} ${
                              u.isOwner ? styles.roleBadgeAdmin : styles.roleBadgeUser
                            }`}
                          >
                            {u.isOwner ? "proprietaire" : u.role}
                          </span>
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellMuted}`}>
                          {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellMuted}`}>
                          {new Date(u.lastSeen).toLocaleString("fr-FR")}
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.actions}>
                            {u.isOwner ? (
                              <span className={styles.selfLabel}>Vous</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                                title="Supprimer"
                              >
                                <Trash2 className={styles.actionIcon} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className={styles.emptyUsers}>Aucun utilisateur trouve</div>
                )}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={styles.paginationBtn}
                  >
                    <ChevronLeft className={styles.actionIcon} />
                  </button>
                  <span className={styles.paginationText}>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={styles.paginationBtn}
                  >
                    <ChevronRight className={styles.actionIcon} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        )}

        {adminTab === "requests" && (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Demandes d&apos;ajout</h2>
            </div>
            <div className={styles.tableScroll}>
              <AdminRequestsPanel enabled={adminTab === "requests"} />
            </div>
          </div>
        )}

        {adminTab === "movies" && (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Gestion des films</h2>
            </div>
            <div className={styles.tableScroll}>
              <AdminMoviesPanel enabled={adminTab === "movies"} />
            </div>
          </div>
        )}

        {adminTab === "sources" && (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Gestion des sources</h2>
            </div>
            <div className={styles.tableScroll}>
              <AdminSourcesPanel enabled={adminTab === "sources"} />
            </div>
          </div>
        )}

        {adminTab === "apis" && (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Gestion des clés API</h2>
            </div>
            <div className={styles.tableScroll}>
              <AdminApisPanel enabled={adminTab === "apis"} />
            </div>
          </div>
        )}

        {adminTab === "dmca" && (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Signalements DMCA</h2>
            </div>
            <div className={styles.tableScroll}>
              <AdminDmcaPanel enabled={adminTab === "dmca"} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
