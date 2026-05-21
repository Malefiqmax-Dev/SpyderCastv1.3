export interface ProfileIcon {
  id: string
  label: string
  url: string
  category: "spydercast" | "anime" | "hero"
}

export const DEFAULT_PROFILE_ICON_ID = "sc-logo"

export const PROFILE_ICONS: ProfileIcon[] = [
  { id: "sc-logo", label: "SpyderCast", url: "/icon.png", category: "spydercast" },
  { id: "cr-puck", label: "Puck", url: "https://static.crunchyroll.com/assets/avatar/170x170/0011-puck.png", category: "anime" },
  { id: "cr-emilia", label: "Emilia", url: "https://static.crunchyroll.com/assets/avatar/170x170/0013-emilia.png", category: "anime" },
  { id: "cr-boruto", label: "Boruto", url: "https://static.crunchyroll.com/assets/avatar/170x170/0024-boruto.png", category: "anime" },
  { id: "cr-sarada", label: "Sarada", url: "https://static.crunchyroll.com/assets/avatar/170x170/0025-sarada.png", category: "anime" },
  { id: "cr-legoshi", label: "Legoshi", url: "https://static.crunchyroll.com/assets/avatar/170x170/0048-legoshi.png", category: "anime" },
  { id: "cr-senku", label: "Senku", url: "https://static.crunchyroll.com/assets/avatar/170x170/0060-senku.png", category: "anime" },
  { id: "cr-tanjiro", label: "Tanjiro", url: "https://static.crunchyroll.com/assets/avatar/170x170/0058-tanjiro.png", category: "anime" },
  { id: "cr-nezuko", label: "Nezuko", url: "https://static.crunchyroll.com/assets/avatar/170x170/0059-nezuko.png", category: "anime" },
  { id: "cr-goku", label: "Goku", url: "https://static.crunchyroll.com/assets/avatar/170x170/0001-goku.png", category: "hero" },
  { id: "cr-luffy", label: "Luffy", url: "https://static.crunchyroll.com/assets/avatar/170x170/0002-luffy.png", category: "hero" },
  { id: "cr-naruto", label: "Naruto", url: "https://static.crunchyroll.com/assets/avatar/170x170/0003-naruto.png", category: "hero" },
  { id: "cr-sasuke", label: "Sasuke", url: "https://static.crunchyroll.com/assets/avatar/170x170/0004-sasuke.png", category: "hero" },
  { id: "cr-ichigo", label: "Ichigo", url: "https://static.crunchyroll.com/assets/avatar/170x170/0005-ichigo.png", category: "hero" },
  { id: "cr-edward", label: "Edward", url: "https://static.crunchyroll.com/assets/avatar/170x170/0006-edward.png", category: "hero" },
  { id: "cr-alphonse", label: "Alphonse", url: "https://static.crunchyroll.com/assets/avatar/170x170/0007-alphonse.png", category: "hero" },
  { id: "cr-eren", label: "Eren", url: "https://static.crunchyroll.com/assets/avatar/170x170/0008-eren.png", category: "hero" },
  { id: "cr-mikasa", label: "Mikasa", url: "https://static.crunchyroll.com/assets/avatar/170x170/0009-mikasa.png", category: "hero" },
  { id: "cr-levi", label: "Levi", url: "https://static.crunchyroll.com/assets/avatar/170x170/0010-levi.png", category: "hero" },
  { id: "cr-deku", label: "Deku", url: "https://static.crunchyroll.com/assets/avatar/170x170/0012-deku.png", category: "hero" },
]

export const PROFILE_NAME_COLORS = [
  "#ffffff",
  "#fbbf24",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#10b981",
  "#22c55e",
] as const

const ICON_BY_ID = new Map(PROFILE_ICONS.map((icon) => [icon.id, icon]))
const ICON_BY_URL = new Map(PROFILE_ICONS.map((icon) => [icon.url, icon]))

export function isValidProfileIconId(id: string): boolean {
  return ICON_BY_ID.has(id)
}

export function getProfileIconById(id: string | null | undefined): ProfileIcon {
  if (id && ICON_BY_ID.has(id)) return ICON_BY_ID.get(id)!
  return ICON_BY_ID.get(DEFAULT_PROFILE_ICON_ID)!
}

export function getProfileIconUrl(storedAvatar: string | null | undefined): string {
  if (!storedAvatar) return getProfileIconById(DEFAULT_PROFILE_ICON_ID).url
  if (isValidProfileIconId(storedAvatar)) return getProfileIconById(storedAvatar).url
  if (storedAvatar.startsWith("http") || storedAvatar.startsWith("/")) return storedAvatar
  return getProfileIconById(DEFAULT_PROFILE_ICON_ID).url
}

export function normalizeProfileIconId(storedAvatar: string | null | undefined): string {
  if (!storedAvatar) return DEFAULT_PROFILE_ICON_ID
  if (isValidProfileIconId(storedAvatar)) return storedAvatar
  const matched = ICON_BY_URL.get(storedAvatar)
  if (matched) return matched.id
  return DEFAULT_PROFILE_ICON_ID
}

export function formatProfileUser<T extends {
  id: string
  username: string
  email: string
  role: string
  avatar: string | null
  nameColor: string
  createdAt: Date | string
}>(user: T, isOwner = false) {
  const avatarIconId = normalizeProfileIconId(user.avatar)

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: isOwner ? "admin" : user.role,
    avatarIconId,
    avatarUrl: getProfileIconUrl(avatarIconId),
    nameColor: user.nameColor,
    createdAt: typeof user.createdAt === "string" ? user.createdAt : user.createdAt.toISOString(),
  }
}

export function formatCommentUserSnapshot(user: {
  id: string
  username: string
  avatar?: string | null
  avatarIconId?: string | null
  avatarUrl?: string | null
  nameColor?: string | null
}) {
  const avatarIconId = normalizeProfileIconId(user.avatarIconId ?? user.avatar)

  return {
    id: user.id,
    username: user.username,
    avatarIconId,
    avatarUrl: getProfileIconUrl(avatarIconId),
    nameColor: user.nameColor || "#ffffff",
  }
}

export function resolveStoredCommentUser(user: Record<string, unknown>) {
  const avatarIconId = normalizeProfileIconId(
    (user.avatarIconId as string | undefined) ?? (user.avatar as string | undefined),
  )

  return {
    id: String(user.id ?? ""),
    username: String(user.username ?? "Utilisateur"),
    avatarIconId,
    avatarUrl: typeof user.avatarUrl === "string" ? user.avatarUrl : getProfileIconUrl(avatarIconId),
    nameColor: typeof user.nameColor === "string" ? user.nameColor : "#ffffff",
  }
}
