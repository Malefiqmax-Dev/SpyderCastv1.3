"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronUp, Film, Loader2, Tv } from "lucide-react"
import { getImageUrl } from "@/lib/tmdb"
import type { RequestListItem } from "@/lib/content-requests"
import { REQUEST_STATUS_LABELS } from "@/lib/content-requests"
import { UserAvatar } from "@/components/auth/user-avatar"
import "./request-card.css"

interface RequestCardProps {
  item: RequestListItem
  voting?: boolean
  onVote?: (id: string) => void
  showAdminActions?: boolean
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onReset?: (id: string) => void
  onDelete?: (id: string) => void
}

export function RequestCard({
  item,
  voting = false,
  onVote,
  showAdminActions = false,
  onApprove,
  onReject,
  onReset,
  onDelete,
}: RequestCardProps) {
  const imageUrl = getImageUrl(item.posterPath, "w342")
  const href = item.mediaType === "movie" ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`
  const canVote = item.status === "pending" && !item.inCatalog

  return (
    <article className={`request-card ${item.status === "approved" ? "request-card-approved" : ""}`}>
      <Link href={href} className="request-card-poster-link">
        <div className="request-card-poster-wrap">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 40vw, 180px"
              className="request-card-poster"
            />
          ) : (
            <div className="request-card-no-image">
              {item.mediaType === "movie" ? <Film className="request-card-fallback-icon" /> : <Tv className="request-card-fallback-icon" />}
            </div>
          )}
        </div>
      </Link>

      <div className="request-card-body">
        <div className="request-card-top">
          <div>
            <Link href={href} className="request-card-title">
              {item.title}
            </Link>
            <p className="request-card-meta">
              {item.mediaType === "movie" ? "Film" : "Serie"} · par{" "}
              <span className="request-card-requester">
                <UserAvatar
                  avatarIconId={item.requester.avatarIconId}
                  avatarUrl={item.requester.avatarUrl}
                  username={item.requester.username}
                  size="sm"
                />
                <span style={{ color: item.requester.nameColor }}>{item.requester.username}</span>
              </span>
            </p>
          </div>
          <span className={`request-card-status request-card-status-${item.status}`}>
            {item.inCatalog ? "Disponible" : REQUEST_STATUS_LABELS[item.status]}
          </span>
        </div>

        {item.message && <p className="request-card-message">&quot;{item.message}&quot;</p>}
        {item.adminNote && item.status !== "pending" && (
          <p className="request-card-admin-note">Admin : {item.adminNote}</p>
        )}

        <div className="request-card-footer">
          <button
            type="button"
            disabled={!canVote || voting || !onVote}
            onClick={() => onVote?.(item.id)}
            className={`request-card-vote-btn ${item.hasVoted ? "request-card-vote-btn-active" : ""}`}
          >
            {voting ? (
              <Loader2 className="request-card-vote-icon request-card-vote-spin" />
            ) : (
              <ChevronUp className="request-card-vote-icon" />
            )}
            <span>{item.voteCount}</span>
          </button>

          <span className="request-card-date">
            {new Date(item.createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>

        {showAdminActions && (
          <div className="request-card-admin-actions">
            {item.status === "pending" && (
              <>
                <button type="button" className="request-card-admin-btn request-card-admin-approve" onClick={() => onApprove?.(item.id)}>
                  Accepter
                </button>
                <button type="button" className="request-card-admin-btn request-card-admin-reject" onClick={() => onReject?.(item.id)}>
                  Refuser
                </button>
              </>
            )}
            {item.status !== "pending" && (
              <button type="button" className="request-card-admin-btn" onClick={() => onReset?.(item.id)}>
                Remettre en attente
              </button>
            )}
            <button type="button" className="request-card-admin-btn request-card-admin-delete" onClick={() => onDelete?.(item.id)}>
              Supprimer
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
