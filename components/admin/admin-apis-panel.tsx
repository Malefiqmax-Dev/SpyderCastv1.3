"use client"

import { useCallback, useEffect, useState } from "react"
import { Key, Plus, Trash2, Copy, Check, Loader2, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"

interface AdminApisPanelProps {
  enabled: boolean
}

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string
  isActive: boolean
  lastUsed: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export function AdminApisPanel({ enabled }: AdminApisPanelProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    permissions: "read",
    expiresAt: "",
  })

  const loadApiKeys = useCallback(async () => {
    if (!enabled) return
    setLoading(true)

    try {
      const res = await fetch("/api/admin/api-keys", { cache: "no-store" })
      if (!res.ok) throw new Error("fetch_failed")

      const data = await res.json()
      setApiKeys(data.apiKeys || [])
    } catch {
      toast.error("Impossible de charger les clés API.")
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    loadApiKeys()
  }, [loadApiKeys])

  async function handleAddApiKey(e: React.FormEvent) {
    e.preventDefault()

    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          permissions: formData.permissions,
          expiresAt: formData.expiresAt || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Ajout impossible.")
        return
      }

      const data = await res.json()
      toast.success(`Clé API créée: ${data.apiKey.key}`)
      setFormData({ name: "", permissions: "read", expiresAt: "" })
      setShowAddForm(false)
      loadApiKeys()
    } catch {
      toast.error("Erreur lors de l'ajout.")
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean) {
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Action impossible.")
        return
      }

      toast.success("Clé API mise à jour.")
      loadApiKeys()
    } catch {
      toast.error("Erreur lors de la mise à jour.")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette clé API ?")) return

    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Suppression impossible.")
        return
      }

      toast.success("Clé API supprimée.")
      loadApiKeys()
    } catch {
      toast.error("Erreur lors de la suppression.")
    }
  }

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    toast.success("Clé copiée dans le presse-papier")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getPermissionBadgeClass = (perm: string) => {
    switch (perm) {
      case "admin": return "permission-badge-admin"
      case "write": return "permission-badge-write"
      default: return "permission-badge-read"
    }
  }

  const getPermissionLabel = (perm: string) => {
    switch (perm) {
      case "admin": return "Admin"
      case "write": return "Écriture"
      default: return "Lecture"
    }
  }

  return (
    <div className="admin-apis-panel">
      <div className="admin-apis-header">
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="admin-apis-add-btn"
        >
          <Plus className="admin-apis-add-icon" />
          Ajouter une clé API
        </button>
      </div>

      {showAddForm && (
        <div className="admin-apis-form-card">
          <h3 className="admin-apis-form-title">Ajouter une clé API</h3>
          <form onSubmit={handleAddApiKey} className="admin-apis-form">
            <div className="admin-apis-form-group">
              <label className="admin-apis-form-label">Nom *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="admin-apis-form-input"
                placeholder="Nom de l'application"
              />
            </div>

            <div className="admin-apis-form-group">
              <label className="admin-apis-form-label">Permissions</label>
              <select
                value={formData.permissions}
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                className="admin-apis-form-select"
              >
                <option value="read">Lecture seule</option>
                <option value="write">Lecture et écriture</option>
                <option value="admin">Admin complet</option>
              </select>
            </div>

            <div className="admin-apis-form-group">
              <label className="admin-apis-form-label">Date d'expiration (optionnel)</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="admin-apis-form-input"
              />
            </div>

            <div className="admin-apis-form-actions">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="admin-apis-cancel-btn"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="admin-apis-submit-btn"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="admin-apis-loading">
          <Loader2 className="admin-apis-loader" />
        </div>
      ) : (
        <div className="admin-apis-list">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="admin-apis-card">
              <div className="admin-apis-card-header">
                <div className="admin-apis-card-info">
                  <div className="admin-apis-card-title-row">
                    <h3 className="admin-apis-card-title">{apiKey.name}</h3>
                    <span className={`permission-badge ${getPermissionBadgeClass(apiKey.permissions)}`}>
                      {getPermissionLabel(apiKey.permissions)}
                    </span>
                  </div>
                  <div className="admin-apis-card-key-row">
                    <code className="admin-apis-card-key">{apiKey.key}</code>
                    <button
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="admin-apis-copy-btn"
                      title="Copier"
                    >
                      {copiedKey === apiKey.key ? (
                        <Check className="admin-apis-copy-icon" />
                      ) : (
                        <Copy className="admin-apis-copy-icon" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="admin-apis-card-actions">
                  <button
                    onClick={() => handleToggleActive(apiKey.id, apiKey.isActive)}
                    className={`admin-apis-toggle-btn ${apiKey.isActive ? "admin-apis-toggle-active" : "admin-apis-toggle-inactive"}`}
                    title={apiKey.isActive ? "Désactiver" : "Activer"}
                  >
                    {apiKey.isActive ? (
                      <ToggleRight className="admin-apis-toggle-icon" />
                    ) : (
                      <ToggleLeft className="admin-apis-toggle-icon" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(apiKey.id)}
                    className="admin-apis-delete-btn"
                    title="Supprimer"
                  >
                    <Trash2 className="admin-apis-delete-icon" />
                  </button>
                </div>
              </div>

              <div className="admin-apis-card-body">
                <div className="admin-apis-card-row">
                  <span className="admin-apis-card-label">Statut:</span>
                  <span className={apiKey.isActive ? "admin-apis-status-active" : "admin-apis-status-inactive"}>
                    {apiKey.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>

                <div className="admin-apis-card-row">
                  <span className="admin-apis-card-label">Créé le:</span>
                  <span>{new Date(apiKey.createdAt).toLocaleString("fr-FR")}</span>
                </div>

                {apiKey.lastUsed && (
                  <div className="admin-apis-card-row">
                    <span className="admin-apis-card-label">Dernière utilisation:</span>
                    <span>{new Date(apiKey.lastUsed).toLocaleString("fr-FR")}</span>
                  </div>
                )}

                {apiKey.expiresAt && (
                  <div className="admin-apis-card-row">
                    <span className="admin-apis-card-label">Expiration:</span>
                    <span className={new Date(apiKey.expiresAt) < new Date() ? "admin-apis-expired" : ""}>
                      {new Date(apiKey.expiresAt).toLocaleString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {apiKeys.length === 0 && (
            <p className="admin-apis-empty">Aucune clé API trouvée.</p>
          )}
        </div>
      )}
    </div>
  )
}
