import { prisma } from "@/lib/db"
import { getProfileIconUrl, normalizeProfileIconId } from "@/lib/profile-icons"

export type RequestStatus = "pending" | "approved" | "rejected"
export type RequestMediaType = "movie" | "tv"
export type RequestSort = "votes" | "recent"

export interface RequestListItem {
  id: string
  tmdbId: number
  mediaType: RequestMediaType
  title: string
  posterPath: string | null
  message: string | null
  status: RequestStatus
  adminNote: string | null
  voteCount: number
  hasVoted: boolean
  requester: {
    id: string
    username: string
    avatarIconId: string
    avatarUrl: string
    nameColor: string
  }
  createdAt: string
  reviewedAt: string | null
  inCatalog: boolean
}

export async function isContentInCatalog(tmdbId: number, mediaType: RequestMediaType): Promise<boolean> {
  if (mediaType === "movie") {
    const [movie, hls] = await Promise.all([
      prisma.movie.findUnique({ where: { tmdbId }, select: { id: true } }),
      prisma.hLSMovie.findUnique({ where: { tmdbId }, select: { id: true } }),
    ])
    return Boolean(movie || hls)
  }

  const series = await prisma.series.findUnique({
    where: { tmdbId },
    select: { id: true },
  })
  return Boolean(series)
}

export function mapRequestRecord(
  record: {
    id: string
    tmdbId: number
    mediaType: string
    title: string
    posterPath: string | null
    message: string | null
    status: string
    adminNote: string | null
    createdAt: Date
    reviewedAt: Date | null
    user: {
      id: string
      username: string
      avatar: string | null
      nameColor: string
    }
    _count: { votes: number }
  },
  options: { hasVoted?: boolean; inCatalog?: boolean } = {},
): RequestListItem {
  return {
    id: record.id,
    tmdbId: record.tmdbId,
    mediaType: record.mediaType as RequestMediaType,
    title: record.title,
    posterPath: record.posterPath,
    message: record.message,
    status: record.status as RequestStatus,
    adminNote: record.adminNote,
    voteCount: record._count.votes,
    hasVoted: options.hasVoted ?? false,
    requester: (() => {
      const avatarIconId = normalizeProfileIconId(record.user.avatar)
      return {
        id: record.user.id,
        username: record.user.username,
        avatarIconId,
        avatarUrl: getProfileIconUrl(avatarIconId),
        nameColor: record.user.nameColor,
      }
    })(),
    createdAt: record.createdAt.toISOString(),
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    inCatalog: options.inCatalog ?? false,
  }
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "En attente",
  approved: "Acceptee",
  rejected: "Refusee",
}
