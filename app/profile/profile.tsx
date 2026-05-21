"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/components/auth/auth-context"
import { ProfileIconPicker } from "@/components/auth/profile-icon-picker"
import { UserAvatar } from "@/components/auth/user-avatar"
import { AuthModal } from "@/components/auth/auth-modal"
import { DEFAULT_PROFILE_ICON_ID, PROFILE_NAME_COLORS } from "@/lib/profile-icons"
import {
  Bookmark,
  CalendarDays,
  Eye,
  Heart,
  Loader2,
  LogOut,
  Mail,
  Palette,
  Save,
  Shield,
  User,
} from "lucide-react"
import { toast } from "sonner"
import "./profile.css"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, isOwner, profileStats, signOut, updateProfile } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [selectedIconId, setSelectedIconId] = useState(DEFAULT_PROFILE_ICON_ID)
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    setUsername(user.username)
    setSelectedIconId(user.avatarIconId)
    setSelectedColor(user.nameColor)
  }, [user])

  if (isLoading) {
    return (
      <main className="profile-main">
        <div className="profile-loading">
          <Loader2 className="profile-loader" />
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="profile-main">
        <div className="profile-auth-wrap">
          <User className="profile-auth-icon" />
          <h1 className="profile-auth-title">Connexion requise</h1>
          <p className="profile-auth-text">Connectez-vous pour acceder a votre profil SpyderCast.</p>
          <button type="button" onClick={() => setAuthOpen(true)} className="profile-auth-btn">
            Se connecter
          </button>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        <Footer />
      </main>
    )
  }

  async function handleSave() {
    setSaving(true)
    setError("")

    const result = await updateProfile({
      username: username.trim(),
      avatarIconId: selectedIconId,
      nameColor: selectedColor,
    })

    setSaving(false)

    if (result.success) {
      toast.success("Profil mis a jour avec succes.")
      return
    }

    setError(result.error || "Impossible de sauvegarder le profil.")
  }

  return (
    <main className="profile-main">
      <div className="profile-wrapper">
        <div className="profile-header">
          <div>
            <h1 className="profile-title">Mon profil</h1>
            <p className="profile-subtitle">Personnalisez votre identite SpyderCast</p>
          </div>
          <div className="profile-header-actions">
            {isOwner && (
              <Link href="/admin" className="profile-admin-link">
                <Shield className="profile-action-icon" />
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={async () => {
                await signOut()
                router.push("/")
              }}
              className="profile-logout-btn"
            >
              <LogOut className="profile-action-icon" />
              Deconnexion
            </button>
          </div>
        </div>

        <div className="profile-layout">
          <section className="profile-card profile-card-preview">
            <UserAvatar avatarIconId={selectedIconId} username={username} size="xl" />
            <div className="profile-preview-info">
              <p className="profile-preview-name" style={{ color: selectedColor }}>
                {username}
              </p>
              <p className="profile-preview-email">
                <Mail className="profile-inline-icon" />
                {user.email}
              </p>
              <p className="profile-preview-date">
                <CalendarDays className="profile-inline-icon" />
                Membre depuis {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>

            <div className="profile-stats-grid">
              <div className="profile-stat">
                <Bookmark className="profile-stat-icon" />
                <span>{profileStats.watchLater}</span>
                <small>A regarder</small>
              </div>
              <div className="profile-stat">
                <Eye className="profile-stat-icon" />
                <span>{profileStats.watched}</span>
                <small>Vus</small>
              </div>
              <div className="profile-stat">
                <Heart className="profile-stat-icon" />
                <span>{profileStats.liked}</span>
                <small>Aimes</small>
              </div>
            </div>
          </section>

          <section className="profile-card profile-card-form">
            <h2 className="profile-section-title">Parametres du profil</h2>

            {error && <div className="profile-error">{error}</div>}

            <div className="profile-field">
              <label className="profile-label">
                <User className="profile-label-icon" />
                Pseudo
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="profile-input"
                style={{ color: selectedColor }}
                maxLength={20}
              />
            </div>

            <div className="profile-field">
              <label className="profile-label">Icone de profil</label>
              <ProfileIconPicker selectedIconId={selectedIconId} onSelect={setSelectedIconId} />
            </div>

            <div className="profile-field">
              <label className="profile-label">
                <Palette className="profile-label-icon" />
                Couleur du pseudo
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

            <button type="button" onClick={handleSave} disabled={saving} className="profile-save-btn">
              {saving ? <Loader2 className="profile-save-icon profile-save-spin" /> : <Save className="profile-save-icon" />}
              Enregistrer le profil
            </button>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
