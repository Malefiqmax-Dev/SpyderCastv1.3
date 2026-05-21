"use client"

import React, { useState } from "react"
import { X, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import styles from "./auth-modal.module.css"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const { signIn, signUp } = useAuth()

  if (!isOpen) return null

  function reset() {
    setEmail(""); setPassword(""); setUsername(""); setError(""); setSuccess(""); setShowPassword(false); setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setSuccess("")
    if (mode === "signup") {
      if (!username.trim()) { setError("Veuillez entrer un nom d'utilisateur."); return }
      if (username.trim().length < 3) { setError("Le nom d'utilisateur doit contenir au moins 3 caracteres."); return }
    }
    if (!email.trim()) { setError("Veuillez entrer votre email."); return }
    if (!password.trim() || password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caracteres."); return }
    setLoading(true)
    if (mode === "signin") {
      const result = await signIn(email, password)
      setLoading(false)
      if (!result.success) { setError(result.error || "Erreur de connexion."); return }
      reset(); onClose()
    } else {
      const result = await signUp(username.trim(), email, password)
      setLoading(false)
      if (!result.success) { setError(result.error || "Erreur lors de l'inscription."); return }
      setSuccess("Compte cree avec succes ! Connectez-vous maintenant.")
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <button onClick={() => { reset(); onClose() }} className={styles.closeBtn} aria-label="Fermer">
          <X className={styles.closeIcon} />
        </button>

        <div className={styles.header}>
          <span className={styles.logo}>
            Spyder<span className={styles.logoAccent}>Cast</span>
          </span>
          <p className={styles.subtitle}>
            {mode === "signin" ? "Connectez-vous a votre compte" : "Creez votre compte"}
          </p>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}
        {success && <div className={styles.alertSuccess}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "signup" && (
            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>Nom d{"'"}utilisateur</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Exemple" className={styles.input} />
            </div>
          )}
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" disabled={loading} className={`${styles.input} ${styles.inputDisabled}`} />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Mot de passe</label>
            <div className={styles.passwordWrap}>
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caracteres minimum" disabled={loading} className={styles.passwordInput} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.togglePassword} aria-label={showPassword ? "Masquer" : "Afficher"}>
                {showPassword ? <EyeOff className={styles.toggleIcon} /> : <Eye className={styles.toggleIcon} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading && <Loader2 className={styles.submitIcon} />}
            {mode === "signin" ? "Se connecter" : "Creer un compte"}
          </button>
        </form>

        <div className={styles.footer}>
          {mode === "signin" ? (
            <>Pas encore de compte ? <button onClick={() => { setMode("signup"); setError(""); setSuccess("") }} className={styles.linkBtn}>S{"'"}inscrire</button></>
          ) : (
            <>Deja un compte ? <button onClick={() => { setMode("signin"); setError(""); setSuccess("") }} className={styles.linkBtn}>Se connecter</button></>
          )}
        </div>
      </div>
    </div>
  )
}
