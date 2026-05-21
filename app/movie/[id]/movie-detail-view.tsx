"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Play, Star, Clock, Calendar, Heart, BookmarkPlus, Eye, Youtube } from "lucide-react"
import { PlayerModal } from "@/components/player/player-modal"
import { SmartlinkPopup } from "@/components/player/smartlink-popup"
import { AuthModal } from "@/components/auth/auth-modal"
import { UserAvatar } from "@/components/auth/user-avatar"
import { WatchPartyUI } from "@/components/watch-party/watch-party-ui"
import { useAuth } from "@/components/auth/auth-context"
import { resolveStoredCommentUser } from "@/lib/profile-icons"
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
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user, isLiked, isWatched, isWatchLater, toggleLike, toggleWatched, toggleWatchLater } =
    useAuth()

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/movies/comments?movieId=${movie.id}`)
        const data = await res.json()
        setComments(data)
      } catch (e) {
        console.error("Failed to fetch comments", e)
      }
    }
    fetchComments()
  }, [movie.id])

  async function handlePublish() {
    if (!comment.trim() || submitting || !user) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/movies/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movie.id,
          content: comment,
          user: {
            id: user.id,
            username: user.username,
            avatarIconId: user.avatarIconId,
            avatarUrl: user.avatarUrl,
            nameColor: user.nameColor,
          },
        }),
      })
      const newComment = await res.json()
      setComments([newComment, ...comments])
      setComment("")
    } catch (e) {
      alert("Erreur lors de la publication")
    } finally {
      setSubmitting(false)
    }
  }

  function getRelativeDate(dateString: string) {
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "à l'instant"
    if (minutes < 60) return `il y a ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `il y a ${hours} h`
    return `il y a ${Math.floor(hours / 24)} j`
  }

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

                  <WatchPartyUI mediaType="movie" tmdbId={movie.id} />

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

            <div className={styles.commentsCol}>
              <h2 className={styles.commentsTitle}>Commentaires</h2>
              {user ? (
                <div className={styles.commentForm}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Laisser un commentaire..."
                    className={styles.commentTextarea}
                    rows={3}
                  />
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={submitting || !comment.trim()}
                    className={styles.commentSubmit}
                  >
                    {submitting ? "Publication..." : "Publier"}
                  </button>
                </div>
              ) : (
                <div className={styles.commentLogin}>
                  <p className={styles.commentLoginText}>Connectez-vous pour laisser un avis.</p>
                  <button type="button" onClick={() => setAuthOpen(true)} className={styles.commentLoginBtn}>
                    Se connecter
                  </button>
                </div>
              )}

              <div className={styles.commentsList}>
                {comments.map((c: any) => {
                  const commentUser = resolveStoredCommentUser(c.user)
                  return (
                  <div key={c.id} className={styles.commentItem}>
                    <div className={styles.commentHeader}>
                      <UserAvatar
                        avatarIconId={commentUser.avatarIconId}
                        avatarUrl={commentUser.avatarUrl}
                        username={commentUser.username}
                        size="sm"
                        className={styles.commentAvatar}
                      />
                      <p className={styles.commentUsername} style={{ color: commentUser.nameColor }}>
                        {commentUser.username}
                      </p>
                    </div>
                    <p className={styles.commentContent}>{c.content}</p>
                    <p className={styles.commentDate}>{getRelativeDate(c.createdAt)}</p>
                  </div>
                  )
                })}
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
