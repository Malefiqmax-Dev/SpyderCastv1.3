"use client"

import { X, Loader2, ShieldCheck, AlertCircle } from "lucide-react"
import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { TurnstileWrapper as Turnstile } from "@/components/captcha/turnstile-captcha"
import { ExternalIframePlayer } from "./external-iframe-player"
import { PremiumSourcePicker } from "./premium-source-picker"
import Image from "next/image"
import dynamic from "next/dynamic"
import {
  buildExternalSourceUrl,
  getPlayerSource,
  isExternalSource,
  isNativeSource,
  type PlayerSourceId,
} from "@/lib/player-sources"
import styles from "./player-modal.module.css"

const Hls = dynamic(() => import("hls.js"), { ssr: false })
const Plyr = dynamic(() => import("plyr"), { ssr: false })

interface PlayerModalProps {
  url?: string
  tmdbId?: number
  mediaType?: "movie" | "tv"
  season?: number
  episode?: number
  title: string
  overview?: string
  backdropPath?: string | null
  onClose: () => void
}

export function PlayerModal({
  url,
  tmdbId,
  mediaType,
  season,
  episode,
  title,
  backdropPath,
  onClose,
}: PlayerModalProps) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sourceWarning, setSourceWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(true) // Temporarily disabled captcha
  const [contentType, setContentType] = useState<string>("mp4")
  const [selectedSourceId, setSelectedSourceId] = useState<PlayerSourceId>("eau")

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const hlsRef = useRef<any>(null)

  const selectedSource = useMemo(
    () => getPlayerSource(selectedSourceId),
    [selectedSourceId],
  )

  const externalUrl = useMemo(() => {
    if (!tmdbId || !mediaType || !isExternalSource(selectedSource)) return null
    return buildExternalSourceUrl(selectedSource, {
      tmdbId,
      mediaType,
      season,
      episode,
    })
  }, [tmdbId, mediaType, season, episode, selectedSource])

  const destroyPlayer = useCallback(() => {
    hlsRef.current?.destroy()
    hlsRef.current = null
    playerRef.current?.destroy()
    playerRef.current = null

    const video = videoRef.current
    if (video) {
      video.pause()
      video.removeAttribute("src")
      video.load()
    }
  }, [])

  const initPlayer = useCallback(async (source: string, type: string) => {
    const video = videoRef.current
    if (!video) return

    destroyPlayer()

    const defaultOptions: any = {
      captions: { active: true, update: true, language: "fr" },
      quality: { default: 1080, options: [4320, 2880, 2160, 1440, 1080, 720, 540, 480, 360, 240] },
      controls: [
        "play-large", "play", "progress", "current-time", "mute", "volume", "captions", "settings", "pip", "airplay", "fullscreen",
      ],
      i18n: {
        restart: "Recommencer",
        rewind: "Reculer de {seektime}s",
        play: "Lire",
        pause: "Pause",
        fastForward: "Avancer de {seektime}s",
        seek: "Rechercher",
        seekLabel: "{currentTime} de {duration}",
        played: "Joué",
        buffered: "Mis en mémoire tampon",
        currentTime: "Temps actuel",
        duration: "Durée",
        volume: "Volume",
        mute: "Muet",
        unmute: "Activer le son",
        enableCaptions: "Activer les sous-titres",
        disableCaptions: "Désactiver les sous-titres",
        download: "Télécharger",
        enterFullscreen: "Plein écran",
        exitFullscreen: "Quitter le plein écran",
        frameTitle: "Lecteur pour {title}",
        captions: "Sous-titres",
        settings: "Réglages",
        pip: "Picture-in-picture",
        menuBack: "Retour au menu précédent",
        speed: "Vitesse",
        normal: "Normal",
        quality: "Qualité",
        loop: "Boucle",
      },
    }

    if (type === "hls") {
      const HlsModule = await Hls
      const PlyrModule = await Plyr
      if (HlsModule.isSupported()) {
        const hls = new HlsModule.default()
        hlsRef.current = hls
        hls.loadSource(source)
        hls.attachMedia(video)
        hls.on(HlsModule.Events.MANIFEST_PARSED, () => {
          playerRef.current = new PlyrModule.default(video, defaultOptions)
        })
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source
        const PlyrModule = await Plyr
        playerRef.current = new PlyrModule.default(video, defaultOptions)
      }
    } else {
      video.src = source
      const PlyrModule = await Plyr
      playerRef.current = new PlyrModule.default(video, defaultOptions)
    }
  }, [destroyPlayer])

  useEffect(() => {
    if (!isVerified || !isNativeSource(selectedSource)) {
      destroyPlayer()
      return
    }

    if (!sourceUrl) return

    const timer = window.setTimeout(() => {
      initPlayer(sourceUrl, contentType)
    }, 100)

    return () => {
      window.clearTimeout(timer)
      destroyPlayer()
    }
  }, [isVerified, sourceUrl, contentType, selectedSource, initPlayer, destroyPlayer])

  useEffect(() => {
    if (url && !url.startsWith("/api/")) {
      setIsVerified(true)
      setSourceUrl(url)
    }
  }, [url])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  useEffect(() => {
    return () => destroyPlayer()
  }, [destroyPlayer])

  const handleVerify = useCallback(async (token: string) => {
    if (!tmdbId || !mediaType) {
      setIsVerified(true)
      return
    }

    setLoading(true)
    setError(null)
    setSourceWarning(null)

    try {
      const res = await fetch("/api/player/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType, season, episode, turnstileToken: token }),
      })
      const data = await res.json()

      if (data.url) {
        setSourceUrl(data.url)
        setContentType(data.type || "mp4")
      } else if (data.message) {
        setSourceWarning(data.message)
      } else if (data.error) {
        setSourceWarning(data.error)
      }

      setIsVerified(true)
    } catch {
      setSourceWarning("Source locale indisponible. Les sources Feu et Éclair restent accessibles.")
      setIsVerified(true)
    } finally {
      setLoading(false)
    }
  }, [tmdbId, mediaType, season, episode])

  function renderPlayerContent() {
    if (isExternalSource(selectedSource)) {
      if (!externalUrl) {
        return (
          <div className={styles.unavailableState}>
            <AlertCircle className={styles.unavailableIcon} />
            <p>Impossible de charger cette source externe pour ce contenu.</p>
          </div>
        )
      }

      return (
        <ExternalIframePlayer
          url={externalUrl}
          title={title}
          loadingLabel={`Chargement de ${selectedSource.label}...`}
          bypassSandbox={selectedSource.id === "vidking" || selectedSource.id === "videasy" || selectedSource.id === "peachify" || selectedSource.id === "feu" || selectedSource.id === "nontongo" || selectedSource.id === "dcp"}
        />
      )
    }

    if (!sourceUrl) {
      return (
        <div className={styles.unavailableState}>
          <AlertCircle className={styles.unavailableIcon} />
          <p>Source locale indisponible pour ce contenu.</p>
          <p className={styles.unavailableHint}>Essayez Feu ou Éclair dans le panneau de sources.</p>
        </div>
      )
    }

    return (
      <video ref={videoRef} className={styles.plyrVideo} playsInline controls>
        <track kind="captions" />
      </video>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <span className={styles.title}>{title}</span>
            {isVerified && (
              <span className={styles.activeSourceBadge}>
                {selectedSource.label} · {selectedSource.lang}
              </span>
            )}
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Fermer le lecteur">
            <X className={styles.iconMd} />
          </button>
        </div>

        <div className={styles.playerArea}>
          {isVerified ? (
            <div className={styles.verifiedLayout}>
              <div className={styles.mediaColumn}>
                {sourceWarning && (
                  <div className={styles.warningBanner}>
                    <AlertCircle className={styles.warningIcon} />
                    {sourceWarning}
                  </div>
                )}
                <div className={styles.videoWrapper}>{renderPlayerContent()}</div>
              </div>

              <aside className={styles.sourcesAside}>
                <PremiumSourcePicker
                  selectedId={selectedSourceId}
                  onSelect={setSelectedSourceId}
                />
              </aside>
            </div>
          ) : (
            <div className={styles.verifyLayout}>
              {backdropPath && (
                <Image
                  src={`https://image.tmdb.org/t/p/original${backdropPath}`}
                  alt={title}
                  fill
                  className={styles.backdropImage}
                  priority
                  sizes="100vw"
                />
              )}
              <div className={styles.verifyContent}>
                <ShieldCheck className={styles.shieldIcon} />
                <h2 className={styles.verifyTitle}>Vérification SpyderCast</h2>
                <p className={styles.verifyText}>Validez pour débloquer le lecteur et choisir votre source.</p>

                {error && (
                  <div className={styles.errorBox}>
                    <AlertCircle className={styles.errorIcon} />
                    {error}
                  </div>
                )}

                {!loading ? (
                  <div className={styles.turnstileWrap}>
                    <Turnstile onVerify={handleVerify} />
                  </div>
                ) : (
                  <div className={styles.loadingWrap}>
                    <Loader2 className={styles.loadingIcon} />
                    <p className={styles.loadingText}>Préparation du lecteur...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
