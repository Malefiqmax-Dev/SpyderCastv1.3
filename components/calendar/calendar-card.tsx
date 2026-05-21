"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { getImageUrl } from "@/lib/tmdb"
import type { CalendarItem } from "@/lib/calendar"
import { motion } from "framer-motion"
import "./calendar-card.css"

interface CalendarCardProps {
  item: CalendarItem
}

export function CalendarCard({ item }: CalendarCardProps) {
  const imageUrl = getImageUrl(item.posterPath, "w342")
  const href = item.mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`

  return (
    <motion.div
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="calendar-card-root"
    >
      <Link href={href} className="calendar-card-link">
        <div className="calendar-card-shell">
          <div className="calendar-card-poster-wrap">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
                className="calendar-card-poster"
              />
            ) : (
              <div className="calendar-card-no-image">No Image</div>
            )}
          </div>

          <div className="calendar-card-overlay" />

          <div className="calendar-card-info">
            <div className="calendar-card-rating">
              <Star className="calendar-card-star" />
              <span>{item.voteAverage.toFixed(1)}</span>
            </div>
            <h3 className="calendar-card-title">{item.title}</h3>
            {item.episodeLabel && (
              <p className="calendar-card-episode">{item.episodeLabel}</p>
            )}
          </div>

          <div className="calendar-card-badge">
            {item.mediaType === "movie" ? "Film" : item.episodeInfo?.isBatch ? "Integrale" : "Serie"}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
