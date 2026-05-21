"use client"

import { useState, useEffect } from "react"
import { discoverByGenre, getImageUrl } from "@/lib/tmdb"
import { Footer } from "@/components/layout/footer"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function GenreDetailsClientPage({ 
  id, 
  name 
}: { 
  id: string, 
  name: string 
}) {
  const [movies, setMovies] = useState<any[]>([])
  const [shows, setShows] = useState<any[]>([])
  const [moviePage, setMoviePage] = useState(1)
  const [showPage, setShowPage] = useState(1)

  const loadMore = async (type: "movie" | "tv") => {
    const nextPage = type === "movie" ? moviePage + 1 : showPage + 1
    const discovery = await discoverByGenre(type, parseInt(id), nextPage)
    const results = discovery.results || []
    
    if (type === "movie") {
      setMovies((prev) => [...prev, ...results])
      setMoviePage(nextPage)
    } else {
      setShows((prev) => [...prev, ...results])
      setShowPage(nextPage)
    }
  }

  useEffect(() => {
    const init = async () => {
      const [movieDisc, tvDisc] = await Promise.all([
        discoverByGenre("movie", parseInt(id), 1),
        discoverByGenre("tv", parseInt(id), 1)
      ])
      setMovies(movieDisc.results || [])
      setShows(tvDisc.results || [])
    }
    init()
  }, [id])

  return (
    <main className="genres-main" style={{ width: "100%", padding: "0 20px" }}>
      <div className="genres-wrapper" style={{ width: "100%", maxWidth: "100%" }}>
        <div className="genres-header">
          <h1 className="genres-title">{name}</h1>
          <div className="genres-divider" />
        </div>

        {movies.length > 0 && (
          <section className="media-section">
            <div className="movies-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px",
                padding: "20px"
            }}>
              {movies.map((movie: any) => (
                <motion.div
                  key={movie.id}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link href={`/movie/${movie.id}`} className="movie-card">
                    <div className="movie-card-inner" style={{ position: "relative", aspectRatio: "2/3" }}>
                      {movie.poster_path ? (
                        <Image 
                          src={getImageUrl(movie.poster_path, "w500") || ""} 
                          alt={movie.title || "Movie"}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="movie-image"
                          style={{ objectFit: "cover", borderRadius: "8px" }}
                        />
                      ) : (
                        <div className="movie-placeholder" style={{ backgroundColor: "#222", height: "100%", borderRadius: "8px" }} />
                      )}
                    </div>
                    <h3 style={{ marginTop: "10px", fontSize: "1rem", color: "#fff" }}>{movie.title}</h3>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
                <button onClick={() => loadMore("movie")} style={{ padding: "15px 30px", backgroundColor: "#FF8C00", color: "#fff", border: "none", borderRadius: "50px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}>Charger plus de films</button>
            </div>
          </section>
        )}

        {shows.length > 0 && (
          <section className="media-section">
            <div className="movies-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px",
                padding: "20px"
            }}>
              {shows.map((show: any) => (
                <motion.div
                  key={show.id}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link href={`/tv/${show.id}`} className="movie-card">
                    <div className="movie-card-inner" style={{ position: "relative", aspectRatio: "2/3" }}>
                      {show.poster_path ? (
                        <Image 
                          src={getImageUrl(show.poster_path, "w500") || ""} 
                          alt={show.name || "Show"}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="movie-image"
                          style={{ objectFit: "cover", borderRadius: "8px" }}
                        />
                      ) : (
                        <div className="movie-placeholder" style={{ backgroundColor: "#222", height: "100%", borderRadius: "8px" }} />
                      )}
                    </div>
                    <h3 style={{ marginTop: "10px", fontSize: "1rem", color: "#fff" }}>{show.name}</h3>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
                <button onClick={() => loadMore("tv")} style={{ padding: "15px 30px", backgroundColor: "#FF8C00", color: "#fff", border: "none", borderRadius: "50px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}>Charger plus de séries</button>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  )
}
