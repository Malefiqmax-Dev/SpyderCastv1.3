/**
 * Authentification custom avec JWT + stockage JSON local.
 */

import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { prisma } from "./db"
import { getOwnerEmail, isOwnerEmail } from "./owner"
import { DEFAULT_PROFILE_ICON_ID, formatProfileUser } from "./profile-icons"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production")
  }
  return new TextEncoder().encode(secret || "spydercast_super_secret_jwt_key_2024")
}

const COOKIE_NAME = "sc_token"

export interface DBUser {
  id: string
  username: string
  email: string
  passwordHash: string
  role: string
  avatar: string | null
  nameColor: string
  createdAt: Date | string
  lastSeen?: Date | string
  watchLater?: any
  watched?: any
  liked?: any
}

export interface SessionUser {
  id: string
  username: string
  email: string
  role: string
  avatar: string
  nameColor: string
  createdAt: string
}

// --- JWT ---

export async function createToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret())
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

// --- Auth functions ---

export async function signUp(username: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { success: false, error: "Un compte existe deja avec cet email." }

  const existingUsername = await prisma.user.findUnique({ where: { username } })
  if (existingUsername) return { success: false, error: "Ce nom d'utilisateur est deja pris." }

  const passwordHash = await bcrypt.hash(password, 12)
  const role = isOwnerEmail(email) ? "admin" : "member"

  await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role,
      avatar: DEFAULT_PROFILE_ICON_ID,
      nameColor: "#ffffff",
    },
  })

  return { success: true }
}

export async function signIn(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { success: false, error: "Email ou mot de passe incorrect." }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { success: false, error: "Email ou mot de passe incorrect." }

  // Update lastSeen
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeen: new Date() },
  })

  const profile = formatProfileUser(user, isOwnerEmail(user.email))

  const sessionUser: SessionUser = {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    role: profile.role,
    avatar: profile.avatarIconId,
    nameColor: profile.nameColor,
    createdAt: profile.createdAt,
  }

  const token = await createToken(sessionUser)
  return { success: true, token, user: profile }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export function getAdminEmail() {
  return getOwnerEmail()
}

export { COOKIE_NAME }
