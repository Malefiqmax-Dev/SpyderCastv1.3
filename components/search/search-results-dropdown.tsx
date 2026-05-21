"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { searchMulti } from "@/lib/tmdb"
import { Loader2, ArrowRight } from "lucide-react"
import styles from "./search-results-dropdown.module.css"

interface SearchResultsDropdownProps {
  query: string
  onClose: () => void
}

export function SearchResultsDropdown({ query, onClose }: SearchResultsDropdownProps) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchMulti(query)
        setResults(data.results.slice(0, 5))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (query.length < 2) return null

  return (
    <div className={styles.root}>
      {loading ? (
        <div className={styles.loading}>
          <Loader2 className={styles.loadingIcon} />
          <span className={styles.loadingText}>Recherche en cours...</span>
        </div>
      ) : results.length > 0 ? (
        <div className={styles.results}>
          <div className={styles.resultsLabel}>Aperçu</div>
          {results.map((item) => {
            const title = item.title || item.name
            const href = item.media_type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`
            const year = (item.release_date || item.first_air_date || "").split("-")[0]
            return (
              <Link key={item.id} href={href} onClick={onClose} className={styles.resultLink}>
                <div className={styles.poster}>
                  {item.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={title} className={styles.posterImg} />
                  ) : (
                    <div className={styles.posterPlaceholder}>No img</div>
                  )}
                </div>
                <div className={styles.resultBody}>
                  <p className={styles.resultTitle}>{title}</p>
                  <div className={styles.resultMeta}>
                    <span className={styles.mediaBadge}>
                      {item.media_type === "movie" ? "Film" : "Série"}
                    </span>
                    {year && <span className={styles.year}>{year}</span>}
                  </div>
                </div>
                <ArrowRight className={styles.resultArrow} />
              </Link>
            )
          })}
          <div className={styles.footer}>
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className={styles.viewAllLink}
            >
              Voir tous les resultats
              <ArrowRight className={styles.viewAllIcon} />
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Aucun résultat trouvé pour &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  )
}
