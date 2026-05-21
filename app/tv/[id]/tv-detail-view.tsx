"use client"

import Image from "next/image"
import { useState } from "react"
import { Play, Star, Calendar, Heart, BookmarkPlus, Eye, Youtube, ChevronDown } from "lucide-react"
import { PlayerModal } from "@/components/player/player-modal"
import { SmartlinkPopup } from "@/components/player/smartlink-popup"
import { AuthModal } from "@/components/auth/auth-modal"
import { WatchPartyUI } from "@/components/watch-party/watch-party-ui"
import { useAuth } from "@/components/auth/auth-context"
import styles from "./page.module.css"

interface TVDetailViewProps {
  show: any
  backdropUrl: string | null
  posterUrl: string | null
  cast: any[]
  trailerKey: string | null
}

export function TVDetailView({
  show,
  backdropUrl,
  posterUrl,
  cast,
  trailerKey,
}: TVDetailViewProps) {
  const [playerOpen, setPlayerOpen] = useState(false)
  const [actualPlayerOpen, setActualPlayerOpen] = useState(false)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const { user, isLiked, isWatched, isWatchLater, toggleLike, toggleWatched, toggleWatchLater } =
    useAuth()

  const mediaItem = {
    id: show.id,
    type: "tv" as const,
    title: show.name,
    poster_path: show.poster_path,
    vote_average: show.vote_average,
  }

  const seasons = (show.seasons ?? []).filter((s: any) => s.season_number > 0)
  const totalSeasons = show.number_of_seasons ?? 1
  const totalEpisodes = show.number_of_episodes ?? 0
  const releaseYear = show.first_air_date?.split("-")[0] ?? ""
  const genres = (show.genres ?? []).map((g: any) => g.name).join(", ")

  const currentSeason = seasons.find((s: any) => s.season_number === selectedSeason) ?? seasons[0]
  const episodeCount = currentSeason?.episode_count ?? 12
  const episodes = Array.from({ length: episodeCount }, (_, i) => i + 1)

  const liked = isLiked(show.id, "tv")
  const watchLater = isWatchLater(show.id, "tv")
  const watched = isWatched(show.id, "tv")

  return (
    <>
      <div className={styles.hero}>
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={show.name}
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
                      alt={show.name}
                      fill
                      className={styles.posterImage}
                      sizes="(max-width: 1024px) 192px, 256px"
                    />
                  </div>
                </div>
              )}

              <div className={styles.info}>
                <h1 className={styles.title}>{show.name}</h1>

                {show.tagline && <p className={styles.tagline}>{show.tagline}</p>}

                <div className={styles.meta}>
                  {show.vote_average > 0 && (
                    <span className={styles.metaRating}>
                      <Star className={styles.metaIcon} />
                      {show.vote_average.toFixed(1)}
                    </span>
                  )}
                  {releaseYear && (
                    <span className={styles.metaItem}>
                      <Calendar className={styles.metaIconOutline} />
                      {releaseYear}
                    </span>
                  )}
                  <span className={styles.seasonBadge}>
                    {totalSeasons} saison{totalSeasons > 1 ? "s" : ""}
                  </span>
                  <span className={styles.metaText}>{totalEpisodes} episodes</span>
                  {genres && <span className={styles.metaText}>{genres}</span>}
                </div>

                {show.overview && <p className={styles.overview}>{show.overview}</p>}

                <div className={styles.selectorRow}>
                  <div className={styles.selectorField}>
                    <label className={styles.selectorLabel}>Saison</label>
                    <div className={styles.selectorWrap}>
                      <select
                        value={selectedSeason}
                        onChange={(e) => {
                          setSelectedSeason(Number(e.target.value))
                          setSelectedEpisode(1)
                        }}
                        className={styles.selector}
                      >
                        {seasons.length > 0
                          ? seasons.map((s: any) => (
                              <option key={s.season_number} value={s.season_number}>
                                Saison {s.season_number}
                              </option>
                            ))
                          : Array.from({ length: totalSeasons }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Saison {i + 1}
                              </option>
                            ))}
                      </select>
                      <ChevronDown className={styles.selectorChevron} />
                    </div>
                  </div>

                  <div className={styles.selectorField}>
                    <label className={styles.selectorLabel}>Episode</label>
                    <div className={styles.selectorWrap}>
                      <select
                        value={selectedEpisode}
                        onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                        className={styles.selector}
                      >
                        {episodes.map((ep) => (
                          <option key={ep} value={ep}>
                            Episode {ep}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className={styles.selectorChevron} />
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button type="button" onClick={() => setPlayerOpen(true)} className={styles.watchBtn}>
                    <Play className={styles.watchIcon} />
                    S{selectedSeason} E{selectedEpisode}
                  </button>

                  {trailerKey && (
                    <button type="button" onClick={() => setTrailerOpen(true)} className={styles.trailerBtn}>
                      <Youtube className={styles.trailerIcon} />
                      Bande-annonce
                    </button>
                  )}

                  <WatchPartyUI 
                    mediaType="series" 
                    tmdbId={show.id} 
                    season={`S${String(selectedSeason).padStart(2, '0')}`}
                    episode={selectedEpisode}
                  />

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
                  <button type="button" className={styles.commentSubmit}>
                    Publier
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
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {playerOpen && (
        <SmartlinkPopup
          title={`${show.name} - S${selectedSeason}E${selectedEpisode}`}
          onClose={() => {
            setPlayerOpen(false)
            setActualPlayerOpen(true)
          }}
        />
      )}

      {actualPlayerOpen && (
        <PlayerModal
          tmdbId={show.id}
          mediaType="tv"
          season={selectedSeason}
          episode={selectedEpisode}
          title={`${show.name} - S${selectedSeason}E${selectedEpisode}`}
          backdropPath={show.backdrop_path}
          onClose={() => setActualPlayerOpen(false)}
        />
      )}

      {trailerOpen && trailerKey && (
        <PlayerModal
          url={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
          title={`Bande-annonce - ${show.name}`}
          onClose={() => setTrailerOpen(false)}
        />
      )}
    </>
  )
}
