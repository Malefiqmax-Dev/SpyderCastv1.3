"use client"

import Image from "next/image"
import { useState } from "react"
import { Play, Star, Clock, Calendar, Heart, BookmarkPlus, Eye, Youtube } from "lucide-react"
import { PlayerModal } from "@/components/player/player-modal"
import { SmartlinkPopup } from "@/components/player/smartlink-popup"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuth } from "@/components/auth/auth-context"
import styles from "./page.module.css"

interface MovieDetailViewProps {
  movie: any
  backdropUrl: string | null
  posterUrl: string | null
  cast: any[]
  trailerKey: string | null
}

export function MovieDetailView({
  movie,
  backdropUrl,
  posterUrl,
  cast,
  trailerKey,
}: MovieDetailViewProps) {
  const [playerOpen, setPlayerOpen] = useState(false)
  const [actualPlayerOpen, setActualPlayerOpen] = useState(false)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { user, isLiked, isWatched, isWatchLater, toggleLike, toggleWatched, toggleWatchLater } =
    useAuth()

  const mediaItem = {
    id: movie.id,
    type: "movie" as const,
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
  }

  const hours = Math.floor((movie.runtime ?? 0) / 60)
  const minutes = (movie.runtime ?? 0) % 60
  const releaseYear = movie.release_date?.split("-")[0] ?? ""
  const genres = (movie.genres ?? []).map((g: any) => g.name).join(", ")
  const liked = isLiked(movie.id, "movie")
  const watchLater = isWatchLater(movie.id, "movie")
  const watched = isWatched(movie.id, "movie")

  return (
    <>
      <div className={styles.hero}>
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            priority
            className={styles.backdropImage}
            sizes="100vw"
          />
        )}
        <div className={styles.gradientTop} />
        <div className={styles.gradientSide} />

        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.mainCol}>
              {posterUrl && (
                <div className={styles.posterWrap}>
                  <div className={styles.poster}>
                    <Image
                      src={posterUrl}
                      alt={movie.title}
                      fill
                      className={styles.posterImage}
                      sizes="(max-width: 1024px) 192px, 256px"
                    />
                  </div>
                </div>
              )}

              <div className={styles.info}>
                <h1 className={styles.title}>{movie.title}</h1>

                {movie.tagline && <p className={styles.tagline}>{movie.tagline}</p>}

                <div className={styles.meta}>
                  {movie.vote_average > 0 && (
                    <span className={styles.metaRating}>
                      <Star className={styles.metaIcon} />
                      {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                  {releaseYear && (
                    <span className={styles.metaItem}>
                      <Calendar className={styles.metaIconOutline} />
                      {releaseYear}
                    </span>
                  )}
                  {movie.runtime > 0 && (
                    <span className={styles.metaItem}>
                      <Clock className={styles.metaIconOutline} />
                      {hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`}
                    </span>
                  )}
                  {genres && <span className={styles.metaText}>{genres}</span>}
                </div>

                {movie.overview && <p className={styles.overview}>{movie.overview}</p>}

                <div className={styles.actions}>
                  <button type="button" onClick={() => setPlayerOpen(true)} className={styles.watchBtn}>
                    <Play className={styles.watchIcon} />
                    Regarder maintenant
                  </button>

                  {trailerKey && (
                    <button type="button" onClick={() => setTrailerOpen(true)} className={styles.trailerBtn}>
                      <Youtube className={styles.trailerIcon} />
                      Bande-annonce
                    </button>
                  )}

                  {user && (
                    <div className={styles.actionsGroup}>
                      <button
                        type="button"
                        onClick={() => toggleLike(mediaItem)}
                        className={`${styles.actionBtn} ${
                          liked ? styles.actionBtnLiked : styles.actionBtnLikeDefault
                        }`}
                        aria-label="J'aime"
                      >
                        <Heart
                          className={liked ? styles.actionIconFilled : styles.actionIcon}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWatchLater(mediaItem)}
                        className={`${styles.actionBtn} ${
                          watchLater ? styles.actionBtnWatchLaterActive : styles.actionBtnWatchLaterDefault
                        }`}
                        aria-label="Voir plus tard"
                      >
                        <BookmarkPlus className={styles.actionIcon} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWatched(mediaItem)}
                        className={`${styles.actionBtn} ${
                          watched ? styles.actionBtnWatchedActive : styles.actionBtnWatchedDefault
                        }`}
                        aria-label="Marquer comme vu"
                      >
                        <Eye className={styles.actionIcon} />
                      </button>
                    </div>
                  )}
                </div>

                {cast.length > 0 && (
                  <div className={styles.cast}>
                    <h2 className={styles.castTitle}>Acteurs principaux</h2>
                    <div className={styles.castList}>
                      {cast.map((actor: any) => (
                        <span key={actor.id} className={styles.castBadge}>
                          {actor.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {playerOpen && (
        <SmartlinkPopup
          title={movie.title}
          onClose={() => {
            setPlayerOpen(false)
            setActualPlayerOpen(true)
          }}
        />
      )}

      {actualPlayerOpen && (
        <PlayerModal
          tmdbId={movie.id}
          mediaType="movie"
          title={movie.title}
          backdropPath={movie.backdrop_path}
          onClose={() => setActualPlayerOpen(false)}
        />
      )}

      {trailerOpen && trailerKey && (
        <PlayerModal
          url={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
          title={`Bande-annonce - ${movie.title}`}
          onClose={() => setTrailerOpen(false)}
        />
      )}
    </>
  )
}
