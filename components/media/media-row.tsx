"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MediaCard } from "./media-card"
import styles from "./media-row.module.css"

interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  vote_average: number
  media_type?: string
  release_date?: string
  first_air_date?: string
}

interface MediaRowProps {
  title: string
  items: MediaItem[]
  mediaType?: "movie" | "tv"
}

export function MediaRow({ title, items, mediaType }: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" })
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.divider} />
      <div className={styles.rowGroup}>
        <button
          onClick={() => scroll("left")}
          className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
          aria-label="Defiler vers la gauche"
        >
          <ChevronLeft className={styles.chevronIcon} />
        </button>
        <div ref={scrollRef} className={styles.scrollTrack}>
          {items.map((item) => {
            const type = mediaType || (item.media_type as "movie" | "tv") || "movie"
            const itemTitle = item.title || item.name || ""
            return (
              <div key={item.id} className={styles.item}>
                <MediaCard
                  id={item.id}
                  title={itemTitle}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  mediaType={type}
                  releaseDate={item.release_date || item.first_air_date}
                />
              </div>
            )
          })}
        </div>
        <button
          onClick={() => scroll("right")}
          className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
          aria-label="Defiler vers la droite"
        >
          <ChevronRight className={styles.chevronIcon} />
        </button>
      </div>
    </section>
  )
}
