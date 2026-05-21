"use client"

import { useEffect, useState } from "react"
import { RefreshCw, X } from "lucide-react"
import "./livewatch-embed-modal.css"

interface LiveWatchEmbedModalProps {
  title: string
  embedUrl: string
  backupEmbedUrl?: string | null
  onClose: () => void
}

export function LiveWatchEmbedModal({
  title,
  embedUrl,
  backupEmbedUrl,
  onClose,
}: LiveWatchEmbedModalProps) {
  const [useBackup, setUseBackup] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const activeUrl = useBackup && backupEmbedUrl ? backupEmbedUrl : embedUrl

  return (
    <div className="livewatch-modal-overlay">
      <div className="livewatch-modal-shell">
        <div className="livewatch-modal-header">
          <span className="livewatch-modal-title">{title}</span>
          <div className="livewatch-modal-actions">
            {backupEmbedUrl && (
              <button
                type="button"
                onClick={() => setUseBackup((prev) => !prev)}
                className="livewatch-modal-backup-btn"
              >
                <RefreshCw className="livewatch-modal-backup-icon" />
                {useBackup ? "Source principale" : "Source secours"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="livewatch-modal-close-btn"
              aria-label="Fermer le lecteur"
            >
              <X className="livewatch-modal-close-icon" />
            </button>
          </div>
        </div>
        <div className="livewatch-modal-player">
          <iframe
            key={activeUrl}
            src={activeUrl}
            title={title}
            className="livewatch-modal-iframe"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
