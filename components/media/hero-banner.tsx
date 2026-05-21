"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Info } from "lucide-react"
import { getBackdropUrl, getImageUrl } from "@/lib/tmdb"
import { useState, useEffect } from "react"
import styles from "./hero-banner.module.css"

interface HeroItem {
  id: number
  title?: string
  name?: string
  overview: string
  backdrop_path: string | null
  logo_path?: string | null
  media_type?: string
  vote_average: number
}

interface HeroBannerProps {
  items: HeroItem[]
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const featured = items.slice(0, 5)

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(interval)
  }, [featured.length])

  const handleNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % featured.length)
      setIsTransitioning(false)
    }, 500)
  }

  const item = featured[current]
  if (!item) return null

  const backdropUrl = getBackdropUrl(item.backdrop_path)
  const logoUrl = item.logo_path ? getImageUrl(item.logo_path, "w500") : null
  const mediaType = item.media_type === "tv" ? "tv" : "movie"
  const detailUrl = mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`

  return (
    <div className={styles.root}>
      <div className={`${styles.backdrop} ${isTransitioning ? styles.backdropHidden : styles.backdropVisible}`}>
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={item.title || item.name || ""}
            fill
            priority
            className={styles.backdropImage}
            sizes="100vw"
          />
        )}
      </div>

      <div className={styles.overlayBottom} />
      <div className={styles.overlaySide} />
      <div className={styles.overlayDim} />

      <div className={styles.content}>
        <div className={`${styles.contentInner} ${isTransitioning ? styles.contentHidden : styles.contentVisible}`}>
          <div className={styles.logoSection}>
            {logoUrl ? (
              <div className={styles.logoWrapper}>
                <Image
                  src={logoUrl}
                  alt={item.title || item.name || "Logo"}
                  fill
                  className={styles.logoImage}
                  priority
                  sizes="(max-width: 640px) 200px, (max-width: 1024px) 350px, 450px"
                />
              </div>
            ) : (
              <h1 className={styles.fallbackTitle}>
                {item.title || item.name}
              </h1>
            )}
          </div>

          <p className={styles.overview}>
            {item.overview || "Préparez-vous pour une expérience cinématographique exceptionnelle sur SpyderCast."}
          </p>

          <div className={styles.actions}>
            <Link href={detailUrl} className={styles.watchButton}>
              <Play className={`${styles.buttonIcon} ${styles.playIcon}`} />
              Regarder
            </Link>
            <Link href={detailUrl} className={styles.detailsButton}>
              <Info className={styles.buttonIcon} />
              Détails
            </Link>
          </div>
        </div>

        <div className={styles.indicators}>
          {featured.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setCurrent(index)
                  setIsTransitioning(false)
                }, 500)
              }}
              className={`${styles.indicator} ${index === current ? styles.indicatorActive : styles.indicatorInactive}`}
              aria-label={`Voir element ${index + 1}`}
            >
              {index === current && (
                <div className={styles.indicatorProgress} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
