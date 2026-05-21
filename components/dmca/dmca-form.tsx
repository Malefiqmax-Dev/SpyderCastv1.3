"use client"

import { useState } from "react"
import styles from "@/app/dmca/page.module.css"

export function DmcaForm() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    workDescription: "",
    contentUrl: "",
    goodFaith: false,
    accuracy: false,
    signature: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch("/api/dmca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erreur lors de l'envoi." })
        return
      }

      setMessage({ type: "success", text: "Signalement envoyé avec succès !" })
      setFormData({
        name: "",
        email: "",
        workDescription: "",
        contentUrl: "",
        goodFaith: false,
        accuracy: false,
        signature: "",
      })
      setTimeout(() => setShowForm(false), 2000)
    } catch {
      setMessage({ type: "error", text: "Erreur lors de l'envoi." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section>
        <h2 className={styles.sectionTitle}>Envoyer un signalement</h2>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={styles.submitButton}
        >
          Envoyer un signalement
        </button>
      </section>

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Formulaire de signalement DMCA</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nom complet *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description de l'œuvre protégée *</label>
                <textarea
                  required
                  value={formData.workDescription}
                  onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>URL du contenu litigieux *</label>
                <input
                  type="url"
                  required
                  value={formData.contentUrl}
                  onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    required
                    checked={formData.goodFaith}
                    onChange={(e) => setFormData({ ...formData, goodFaith: e.target.checked })}
                    className={styles.checkbox}
                  />
                  <span>
                    Je déclare de bonne foi que l'utilisation de l'œuvre n'est pas autorisée par le
                    titulaire des droits
                  </span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    required
                    checked={formData.accuracy}
                    onChange={(e) => setFormData({ ...formData, accuracy: e.target.checked })}
                    className={styles.checkbox}
                  />
                  <span>
                    Je déclare sous peine de parjure que les informations fournies sont exactes
                  </span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Signature électronique *</label>
                <input
                  type="text"
                  required
                  value={formData.signature}
                  onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                  className={styles.input}
                  placeholder="Votre nom complet"
                />
              </div>

              {message && (
                <div
                  className={`${styles.message} ${
                    message.type === "success" ? styles.messageSuccess : styles.messageError
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={styles.cancelButton}
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? "Envoi en cours..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
