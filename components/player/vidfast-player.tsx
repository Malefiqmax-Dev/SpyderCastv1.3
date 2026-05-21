"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { buildVidFastUrl, VidFastOptions } from "@/lib/vidfast"
import styles from "./vidfast-player.module.css"

interface VidFastPlayerProps extends VidFastOptions {
  title: string
}

export function VidFastPlayer(props: VidFastPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [url, setUrl] = useState("")

  useEffect(() => {
    setUrl(buildVidFastUrl(props))
  }, [props])

  const handleRetry = () => {
    setError(false)
    setIsLoading(true)
    const newUrl = buildVidFastUrl(props)
    setUrl("")
    setTimeout(() => setUrl(newUrl), 100)
  }

  if (error) {
    return (
      <div className={styles.errorLayout}>
        <AlertCircle className={styles.errorIcon} />
        <p className={styles.errorText}>Impossible de charger la source VOSTFR.</p>
        <button onClick={handleRetry} className={styles.retryBtn}>
          <RefreshCw className={styles.retryIcon} />
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <Loader2 className={styles.loadingIcon} />
          <p className={styles.loadingText}>Chargement de la source Feu...</p>
        </div>
      )}
      <iframe
        src={url}
        className={styles.iframe}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        title={props.title}
        loading="lazy"
      />
    </div>
  )
}
