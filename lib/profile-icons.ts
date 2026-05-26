export interface ProfileIcon {
  id: string
  label: string
  url: string
  category: "aot" | "jjk" | "onepiece" | "drstone"
}

export const DEFAULT_PROFILE_ICON_ID = "aot-eren"

export const PROFILE_ICONS: ProfileIcon[] = [
  { id: "aot-eren", label: "Eren", url: "https://static.crunchyroll.com/assets/avatar/170x170/aot_fc_eren-avatar.png", category: "aot" },
  { id: "aot-mikasa", label: "Mikasa", url: "https://static.crunchyroll.com/assets/avatar/170x170/aot_fc_mikasa-avatar.png", category: "aot" },
  { id: "aot-armin", label: "Armin", url: "https://static.crunchyroll.com/assets/avatar/170x170/aot_fc_armin-avatar.png", category: "aot" },
  { id: "aot-levi", label: "Levi", url: "https://static.crunchyroll.com/assets/avatar/170x170/aot_fc_levi-avatar.png", category: "aot" },
  { id: "jjk-gojo", label: "Gojo", url: "https://static.crunchyroll.com/assets/avatar/170x170/1044-jujutsu-kaisen-satoru-gojo.png", category: "jjk" },
  { id: "jjk-yuji", label: "Yuji", url: "https://static.crunchyroll.com/assets/avatar/170x170/1041-jujutsu-kaisen-yuji-itadori.png", category: "jjk" },
  { id: "jjk-megumi", label: "Megumi", url: "https://static.crunchyroll.com/assets/avatar/170x170/1042-jujutsu-kaisen-megumi-fushigoro.png", category: "jjk" },
  { id: "jjk-sukuna", label: "Sukuna", url: "https://static.crunchyroll.com/assets/avatar/170x170/1045-jujutsu-kaisen-ryomen-sukuna.png", category: "jjk" },
  { id: "op-luffy", label: "Luffy", url: "https://static.crunchyroll.com/assets/avatar/170x170/egghead-luffy.png", category: "onepiece" },
  { id: "op-nami", label: "Nami", url: "https://static.crunchyroll.com/assets/avatar/170x170/egghead-nami.png", category: "onepiece" },
  { id: "op-sanji", label: "Sanji", url: "https://static.crunchyroll.com/assets/avatar/170x170/egghead-sanji.png", category: "onepiece" },
  { id: "op-zoro", label: "Zoro", url: "https://static.crunchyroll.com/assets/avatar/170x170/egghead-zoro.png", category: "onepiece" },
  { id: "ds-senku", label: "Senku", url: "https://static.crunchyroll.com/assets/avatar/170x170/01_senku_avatar.png", category: "drstone" },
  { id: "ds-xeno", label: "Xeno", url: "https://static.crunchyroll.com/assets/avatar/170x170/02_xeno_avatar.png", category: "drstone" },
  { id: "ds-gen", label: "Gen", url: "https://static.crunchyroll.com/assets/avatar/170x170/03_gen_avatar.png", category: "drstone" },
  { id: "ds-chrome", label: "Chrome", url: "https://static.crunchyroll.com/assets/avatar/170x170/05_chrome_avatar.png", category: "drstone" },
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
