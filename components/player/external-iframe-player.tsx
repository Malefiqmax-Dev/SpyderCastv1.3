"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Loader2, RefreshCw } from "lucide-react"
import "./external-iframe-player.css"

interface ExternalIframePlayerProps {
  url: string
  title: string
  loadingLabel?: string
  bypassSandbox?: boolean
}

export function ExternalIframePlayer({
  url,
  title,
  loadingLabel = "Chargement de la source...",
  bypassSandbox = false,
}: ExternalIframePlayerProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    setFailed(false)
  }, [url])

  useEffect(() => {
    if (!mounted || !url) return

    const timeout = window.setTimeout(() => {
      setIsLoading(false)
    }, 12000)

    return () => window.clearTimeout(timeout)
  }, [mounted, url, iframeKey])

  function handleRetry() {
    setFailed(false)
    setIsLoading(true)
    setIframeKey((value) => value + 1)
  }

  if (!mounted || !url) {
    return <div className="external-iframe-placeholder" />
  }

  if (failed) {
    return (
      <div className="external-iframe-error">
        <AlertCircle className="external-iframe-error-icon" />
        <p className="external-iframe-error-text">Impossible de charger cette source externe.</p>
        <button type="button" onClick={handleRetry} className="external-iframe-retry-btn">
          <RefreshCw className="external-iframe-retry-icon" />
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="external-iframe-root">
      {isLoading && (
        <div className="external-iframe-loading">
          <Loader2 className="external-iframe-loading-icon" />
          <p className="external-iframe-loading-text">{loadingLabel}</p>
        </div>
      )}

      <iframe
        key={`${url}-${iframeKey}`}
        src={url}
        title={title}
        className="external-iframe-frame"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        {...(!bypassSandbox && { sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-presentation" })}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setFailed(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}
