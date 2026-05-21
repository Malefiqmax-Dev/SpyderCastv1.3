import { isValidProfileIconId, PROFILE_NAME_COLORS } from "@/lib/profile-icons"

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

export function validateUsername(username: string): string | null {
  const value = username.trim()
  if (!value) return "Le nom d'utilisateur est requis."
  if (value.length < 3 || value.length > 20) return "Le pseudo doit contenir entre 3 et 20 caracteres."
  if (!USERNAME_REGEX.test(value)) {
    return "Le pseudo accepte uniquement lettres, chiffres, tirets et underscores."
  }
  return null
}

export function validateNameColor(color: string): string | null {
  if (!HEX_COLOR_REGEX.test(color)) return "Couleur invalide."
  if (!PROFILE_NAME_COLORS.includes(color as (typeof PROFILE_NAME_COLORS)[number])) {
    return "Couleur non autorisee."
  }
  return null
}

export function validateAvatarIconId(iconId: string): string | null {
  if (!isValidProfileIconId(iconId)) return "Icone de profil invalide."
  return null
}

export function validateProfileUpdates(input: {
  username?: string
  avatarIconId?: string
  nameColor?: string
}): { error: string | null; data: Record<string, string> } {
  const data: Record<string, string> = {}

  if (input.username !== undefined) {
    const error = validateUsername(input.username)
    if (error) return { error, data }
    data.username = input.username.trim()
  }

  if (input.avatarIconId !== undefined) {
    const error = validateAvatarIconId(input.avatarIconId)
    if (error) return { error, data }
    data.avatar = input.avatarIconId
  }

  if (input.nameColor !== undefined) {
    const error = validateNameColor(input.nameColor)
    if (error) return { error, data }
    data.nameColor = input.nameColor
  }

  if (Object.keys(data).length === 0) {
    return { error: "Aucune modification valide.", data }
  }

  return { error: null, data }
}
