"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MediaCard } from "./media-card"
import styles from "./top-10.module.css"

interface Top10Props {
  title: string
  items: any[]
  mediaType?: "movie" | "tv"
}

export function Top10({ title, items, mediaType }: Top10Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const top10 = items.slice(0, 10)

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" })
  }

  if (top10.length === 0) return null

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
          {top10.map((item, index) => {
            const itemTitle = item.title || item.name || ""
            const type: "movie" | "tv" =
              mediaType || (item.media_type as "movie" | "tv") || (item.title ? "movie" : "tv")
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={styles.item}
              >
                <div className={styles.rankWrapper}>
                  <span className={styles.rankNumber}>
                    {index + 1}
                  </span>
                </div>
                <div className={styles.cardWrapper}>
                  <MediaCard
                    id={item.id}
                    title={itemTitle}
                    posterPath={item.poster_path}
                    voteAverage={item.vote_average ?? 0}
                    mediaType={type}
                    releaseDate={item.release_date || item.first_air_date}
                  />
                </div>
              </motion.div>
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
