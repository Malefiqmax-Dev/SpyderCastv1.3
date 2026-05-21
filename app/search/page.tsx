"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Footer } from "@/components/layout/footer"
import { MediaCard } from "@/components/media/media-card"
import { searchMulti } from "@/lib/tmdb"
import { Loader2, SearchIcon } from "lucide-react"
import styles from "./page.module.css"

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(false)
    searchMulti(query)
      .then((data) => {
        const filtered = (data.results ?? []).filter(
          (item: any) => item.media_type === "movie" || item.media_type === "tv"
        )
        setResults(filtered)
      })
      .catch(() => setResults([]))
      .finally(() => {
        setLoading(false)
        setSearched(true)
      })
  }, [query])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <SearchIcon className={styles.headerIcon} />
          <h1 className={styles.title}>Recherche</h1>
        </div>
        {query && (
          <p className={styles.queryHint}>
            Resultats pour <span className={styles.queryHighlight}>&quot;{query}&quot;</span>
          </p>
        )}
      </div>

      {loading && (
        <div className={styles.loadingWrap}>
          <Loader2 className={styles.loader} />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className={styles.emptyState}>
          <SearchIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Aucun resultat pour &quot;{query}&quot;</p>
          <p className={styles.emptySubtitle}>Essayez avec des mots-cles differents</p>
        </div>
      )}

      {!loading && !query && !searched && (
        <div className={styles.emptyState}>
          <SearchIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Recherchez un film ou une serie</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className={styles.resultCount}>
            {results.length} resultat{results.length > 1 ? "s" : ""} trouve
            {results.length > 1 ? "s" : ""}
          </p>
          <div className={styles.grid}>
            {results.map((item: any) => (
              <MediaCard
                key={`${item.media_type}-${item.id}`}
                id={item.id}
                title={item.title || item.name || ""}
                posterPath={item.poster_path}
                voteAverage={item.vote_average ?? 0}
                mediaType={item.media_type === "tv" ? "tv" : "movie"}
                releaseDate={item.release_date || item.first_air_date}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <main className={styles.main}>
      <Suspense
        fallback={
          <div className={styles.suspenseFallback}>
            <Loader2 className={styles.loader} />
          </div>
        }
      >
        <SearchResults />
      </Suspense>
      <Footer />
    </main>
  )
}
