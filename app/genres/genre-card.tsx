"use client"

import Link from "next/link"
import Image from "next/image"
import { getImageUrl } from "@/lib/tmdb"
import { motion } from "framer-motion"

export function GenreCard({ genre }: { genre: any }) {
  const imageUrl = getImageUrl(genre.backdropPath, "w780")

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link 
        href={`/genres/${genre.id}?name=${encodeURIComponent(genre.name)}`}
        className="genre-card-link"
      >
        <div className="genre-card-inner">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={genre.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="genre-card-image"
            />
          ) : (
            <div className="genre-card-placeholder" />
          )}
          <div className="genre-card-overlay" />
          <h2 className="genre-card-title">{genre.name}</h2>
        </div>
      </Link>
    </motion.div>
  )
}
