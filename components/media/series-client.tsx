"use client"

import { useState } from "react"
import { MediaCard } from "@/components/media/media-card"
import { Button } from "@/components/ui/button"
import "./series-client.css"

export function SeriesClient({ initialSeries }: { initialSeries: any[] }) {
  const [series, setSeries] = useState(initialSeries)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tv/load-more?page=${page + 1}`)
      const data = await response.json()
      if (data.series) {
        setSeries((prev) => [...prev, ...data.series.filter((s: any) => !prev.find(p => p.id === s.id))])
        setPage((p) => p + 1)
      }
    } catch (e) {
      console.error("Failed to load more series", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="series-client-grid">
        {series.map((show: any) => (
          <MediaCard
            key={show.id}
            id={show.id}
            title={show.name}
            posterPath={show.poster_path}
            voteAverage={show.vote_average}
            mediaType="tv"
            releaseDate={show.first_air_date}
          />
        ))}
      </div>

      <div className="series-client-load-more-wrap">
        <Button onClick={loadMore} disabled={loading} className="series-client-load-more-btn">
          {loading ? "Chargement..." : "Charger plus"}
        </Button>
      </div>
    </>
  )
}
