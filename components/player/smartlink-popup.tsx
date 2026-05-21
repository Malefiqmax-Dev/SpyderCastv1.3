"use client"

import { useState, useEffect } from "react"
import { Play, ShieldAlert, ArrowRight } from "lucide-react"
import styles from "./smartlink-popup.module.css"

interface SmartlinkPopupProps {
  onClose: () => void
  title: string
  maxSteps?: number
}

const SMARTLINKS = [
  "https://manhoodinvoluntaryplash.com/yu6cwbmz0e?key=78b13d520a3d0cf9d3729fe29fc1be41",
  "https://manhoodinvoluntaryplash.com/jr6ra3dy3r?key=d5843889fc260e2ba624fa638d03a803",
  "https://eminentpercentvandalism.com/nafvy9gp?key=f33fd406565102cbb24c7cb4641b49c6"
]

export function SmartlinkPopup({ onClose, title, maxSteps }: SmartlinkPopupProps) {
  const [step, setStep] = useState(0)
  const totalSteps = Math.min(maxSteps || SMARTLINKS.length, SMARTLINKS.length)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const handleNext = () => {
    window.open(SMARTLINKS[step], "_blank")
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.iconWrap}>
            <ShieldAlert className={styles.icon} />
          </div>
          <h2 className={styles.title}>Publicités</h2>
          <p className={styles.description}>
            Cette courte verification nous permet de maintenir le site gratuit et de soutenir nos serveurs.
          </p>
          <p className={styles.hint}>
            Une fois le lien ouvert, fermez l{"'"}onglet publicitaire et revenez ici.
          </p>
          <p className={styles.stepText}>
            Etape <span className={styles.stepHighlight}>{step + 1} sur {totalSteps}</span>
          </p>
          <div className={styles.progressWrap}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <button onClick={handleNext} className={styles.actionBtn}>
            {step === totalSteps - 1 ? (
              <><Play className={styles.actionIcon} />Accéder à {title}</>
            ) : (
              <>Acceder a l{"'"}etape suivante<ArrowRight className={styles.actionArrow} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
