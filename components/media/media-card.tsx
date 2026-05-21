"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Bookmark, Eye } from "lucide-react"
import { getImageUrl } from "@/lib/tmdb"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth/auth-context"
import { toast } from "sonner"
import styles from "./media-card.module.css"

interface MediaCardProps {
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  mediaType: "movie" | "tv"
  releaseDate?: string
}

export function MediaCard({ id, title, posterPath, voteAverage, mediaType, releaseDate }: MediaCardProps) {
  const { user, toggleWatchLater, toggleWatched, isWatchLater, isWatched } = useAuth()
  const imageUrl = getImageUrl(posterPath, "w342")
  const href = mediaType === "movie" ? `/movie/${id}` : `/tv/${id}`
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null

  const handleAction = (action: "watchLater" | "watched") => {
    if (!user) {
      toast.error("Veuillez vous connecter pour utiliser cette fonctionnalite.")
      return
    }
    const item = { id, type: mediaType, title, poster_path: posterPath, vote_average: voteAverage }
    if (action === "watchLater") toggleWatchLater(item)
    else toggleWatched(item)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1, zIndex: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={styles.root}
    >
      <Link href={href} className={styles.link}>
        <div className={styles.card}>
          <div className={styles.posterWrapper}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
                className={styles.posterImage}
              />
            ) : (
              <div className={styles.noImage}>
                <span className={styles.noImageText}>No Image</span>
              </div>
            )}
          </div>

          <div className={styles.overlay} />

          <div className={styles.actions}>
            {user && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); handleAction("watchLater") }}
                  className={`${styles.actionButton} ${styles.actionButtonWatchLater}`}
                  aria-label="A regarder plus tard"
                >
                  <Bookmark
                    className={`${styles.icon} ${isWatchLater(id, mediaType) ? styles.iconActiveWatchLater : styles.iconInactive}`}
                  />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); handleAction("watched") }}
                  className={`${styles.actionButton} ${styles.actionButtonWatched}`}
                  aria-label="Marquer comme vu"
                >
                  <Eye
                    className={`${styles.icon} ${isWatched(id, mediaType) ? styles.iconActiveWatched : styles.iconInactive}`}
                  />
                </button>
              </>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.ratingRow}>
              <Star className={styles.starIcon} />
              <span className={styles.ratingText}>{voteAverage.toFixed(1)}</span>
            </div>
            <h3 className={styles.title}>{title}</h3>
            {year && <p className={styles.year}>{year}</p>}
          </div>

          <div className={styles.badge}>
            {mediaType === "movie" ? "Film" : "Serie"}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
