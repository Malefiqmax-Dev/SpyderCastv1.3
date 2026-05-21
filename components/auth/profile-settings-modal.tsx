"use client"

import React, { useEffect, useState } from "react"
import { X, Loader2, Palette, User } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { ProfileIconPicker } from "@/components/auth/profile-icon-picker"
import { UserAvatar } from "@/components/auth/user-avatar"
import { DEFAULT_PROFILE_ICON_ID, PROFILE_NAME_COLORS } from "@/lib/profile-icons"
import { toast } from "sonner"
import "./profile-settings-modal.css"

interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, updateProfile } = useAuth()
  const [username, setUsername] = useState("")
  const [selectedIconId, setSelectedIconId] = useState(DEFAULT_PROFILE_ICON_ID)
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || !isOpen) return
    setUsername(user.username)
    setSelectedIconId(user.avatarIconId)
    setSelectedColor(user.nameColor)
    setError("")
  }, [user, isOpen])

  if (!isOpen || !user) return null

  async function handleSave() {
    setError("")
    setLoading(true)

    const result = await updateProfile({
      username: username.trim(),
      avatarIconId: selectedIconId,
      nameColor: selectedColor,
    })

    setLoading(false)

    if (result.success) {
      toast.success("Profil mis a jour.")
      onClose()
      return
    }

    setError(result.error || "Erreur lors de la sauvegarde.")
  }

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-card">
        <button onClick={onClose} className="profile-modal-close" aria-label="Fermer">
          <X className="profile-modal-close-icon" />
        </button>

        <div className="profile-modal-header">
          <h2 className="profile-modal-title">
            Personnalisation <span className="profile-modal-title-accent">Profil</span>
          </h2>
          <p className="profile-modal-subtitle">Configurez votre identite sur SpyderCast.</p>
        </div>

        <div className="profile-modal-preview">
          <UserAvatar
            avatarIconId={selectedIconId}
            username={username || user.username}
            size="xl"
          />
          <div>
            <p className="profile-modal-preview-name" style={{ color: selectedColor }}>
              {username || "Votre pseudo"}
            </p>
            <p className="profile-modal-preview-email">{user.email}</p>
          </div>
        </div>

        {error && <div className="profile-modal-error">{error}</div>}

        <div className="profile-modal-form">
          <div className="profile-modal-field">
            <label className="profile-modal-label">
              <User className="profile-modal-label-icon" /> Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="profile-modal-input"
              style={{ color: selectedColor }}
              maxLength={20}
            />
          </div>

          <div className="profile-modal-field">
            <label className="profile-modal-label">Choisir une icone</label>
            <ProfileIconPicker selectedIconId={selectedIconId} onSelect={setSelectedIconId} />
          </div>

          <div className="profile-modal-field">
            <label className="profile-modal-label">
              <Palette className="profile-modal-label-icon" /> Couleur du nom
            </label>
            <div className="profile-color-grid">
              {PROFILE_NAME_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`profile-color-btn ${selectedColor === color ? "profile-color-btn-active" : ""}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Couleur ${color}`}
                />
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="profile-modal-save-btn">
            {loading && <Loader2 className="profile-modal-save-icon" />}
            Sauvegarder les modifications
          </button>
        </div>
      </div>
    </div>
  )
}
