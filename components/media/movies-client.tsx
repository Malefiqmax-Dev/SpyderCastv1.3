"use client"

import { useState } from "react"
import { MediaCard } from "@/components/media/media-card"
import { Button } from "@/components/ui/button"
import "./movies-client.css"

export function MoviesClient({ initialMovies }: { initialMovies: any[] }) {
  const [movies, setMovies] = useState(initialMovies)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/movies/load-more?page=${page + 1}`)
      const data = await response.json()
      if (data.movies) {
        setMovies((prev) => [...prev, ...data.movies.filter((m: any) => !prev.find(p => p.id === m.id))])
        setPage((p) => p + 1)
      }
    } catch (e) {
      console.error("Failed to load more movies", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="movies-client-grid">
        {movies.map((movie: any) => (
          <MediaCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            voteAverage={movie.vote_average}
            mediaType="movie"
            releaseDate={movie.release_date}
          />
        ))}
      </div>

      <div className="movies-client-load-more-wrap">
        <Button onClick={loadMore} disabled={loading} className="movies-client-load-more-btn">
          {loading ? "Chargement..." : "Charger plus"}
        </Button>
      </div>
    </>
  )
}
