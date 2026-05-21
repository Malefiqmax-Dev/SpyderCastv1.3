"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface AppUser {
  id: string
  username: string
  email: string
  role: string
  avatarIconId: string
  avatarUrl: string
  nameColor: string
  createdAt: string
}

export interface MediaItem {
  id: number
  type: "movie" | "tv"
  title: string
  poster_path: string | null
  vote_average: number
}

export interface ProfileStats {
  liked: number
  watched: number
  watchLater: number
}

interface AuthContextType {
  user: AppUser | null
  isLoading: boolean
  isOwner: boolean
  profileStats: ProfileStats
  likedItems: MediaItem[]
  watchedItems: MediaItem[]
  watchLaterItems: MediaItem[]
  signUp: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (updates: {
    username?: string
    avatarIconId?: string
    nameColor?: string
  }) => Promise<{ success: boolean; error?: string; user?: AppUser }>
  isLiked: (id: number, type: "movie" | "tv") => boolean
  isWatched: (id: number, type: "movie" | "tv") => boolean
  isWatchLater: (id: number, type: "movie" | "tv") => boolean
  toggleLike: (item: MediaItem) => void
  toggleWatched: (item: MediaItem) => void
  toggleWatchLater: (item: MediaItem) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [likedItems, setLikedItems] = useState<MediaItem[]>([])
  const [watchedItems, setWatchedItems] = useState<MediaItem[]>([])
  const [watchLaterItems, setWatchLaterItems] = useState<MediaItem[]>([])
  const [profileStats, setProfileStats] = useState<ProfileStats>({ liked: 0, watched: 0, watchLater: 0 })
  const [isOwner, setIsOwner] = useState(false)

  const applySession = useCallback((data: {
    user?: AppUser | null
    isOwner?: boolean
    liked?: MediaItem[]
    watched?: MediaItem[]
    watchLater?: MediaItem[]
    stats?: ProfileStats
  }) => {
    setUser(data.user ?? null)
    setIsOwner(Boolean(data.isOwner))
    setLikedItems(data.liked || [])
    setWatchedItems(data.watched || [])
    setWatchLaterItems(data.watchLater || [])
    if (data.stats) setProfileStats(data.stats)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (!res.ok) return
      const data = await res.json()
      applySession(data)
    } catch {
      // ignore
    }
  }, [applySession])

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          applySession(data)
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [applySession])

  const signUp = useCallback(async (username: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || "Erreur lors de l'inscription." }
      return { success: true }
    } catch {
      return { success: false, error: "Erreur reseau." }
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || "Email ou mot de passe incorrect." }
      applySession(data)
      return { success: true }
    } catch {
      return { success: false, error: "Erreur reseau." }
    }
  }, [applySession])

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
    } catch {}
    applySession({})
  }, [applySession])

  const updateProfile = useCallback(async (updates: {
    username?: string
    avatarIconId?: string
    nameColor?: string
  }) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || "Erreur." }
      if (data.user) setUser(data.user)
      return { success: true, user: data.user as AppUser }
    } catch {
      return { success: false, error: "Erreur reseau." }
    }
  }, [])

  const toggleLike = useCallback((item: MediaItem) => {
    setLikedItems((prev) => {
      const already = prev.some((i) => i.id === item.id && i.type === item.type)
      const next = already ? prev.filter((i) => !(i.id === item.id && i.type === item.type)) : [...prev, item]
      fetch("/api/auth/list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggleLike", item }) }).catch(() => {})
      return next
    })
  }, [])

  const toggleWatched = useCallback((item: MediaItem) => {
    setWatchedItems((prev) => {
      const already = prev.some((i) => i.id === item.id && i.type === item.type)
      const next = already ? prev.filter((i) => !(i.id === item.id && i.type === item.type)) : [...prev, item]
      fetch("/api/auth/list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggleWatched", item }) }).catch(() => {})
      return next
    })
  }, [])

  const toggleWatchLater = useCallback((item: MediaItem) => {
    setWatchLaterItems((prev) => {
      const already = prev.some((i) => i.id === item.id && i.type === item.type)
      const next = already ? prev.filter((i) => !(i.id === item.id && i.type === item.type)) : [...prev, item]
      fetch("/api/auth/list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggleWatchLater", item }) }).catch(() => {})
      return next
    })
  }, [])

  const isLiked = useCallback((id: number, type: "movie" | "tv") => likedItems.some((i) => i.id === id && i.type === type), [likedItems])
  const isWatched = useCallback((id: number, type: "movie" | "tv") => watchedItems.some((i) => i.id === id && i.type === type), [watchedItems])
  const isWatchLater = useCallback((id: number, type: "movie" | "tv") => watchLaterItems.some((i) => i.id === id && i.type === type), [watchLaterItems])

  return (
    <AuthContext.Provider value={{
      user, isLoading, isOwner, profileStats,
      likedItems, watchedItems, watchLaterItems,
      signUp, signIn, signOut, refreshUser, updateProfile,
      isLiked, isWatched, isWatchLater,
      toggleLike, toggleWatched, toggleWatchLater,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
