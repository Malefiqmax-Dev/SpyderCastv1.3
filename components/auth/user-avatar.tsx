"use client"

import Image from "next/image"
import { getProfileIconUrl } from "@/lib/profile-icons"
import "./user-avatar.css"

interface UserAvatarProps {
  avatarIconId?: string | null
  avatarUrl?: string | null
  username: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const SIZE_MAP = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
} as const

export function UserAvatar({
  avatarIconId,
  avatarUrl,
  username,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const src = avatarUrl || getProfileIconUrl(avatarIconId)
  const dimension = SIZE_MAP[size]

  return (
    <div
      className={`user-avatar user-avatar-${size} ${className}`.trim()}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={src}
        alt={username}
        fill
        sizes={`${dimension}px`}
        className="user-avatar-image"
      />
    </div>
  )
}

export function resolveAvatarSrc(avatarIconId?: string | null, avatarUrl?: string | null) {
  return avatarUrl || getProfileIconUrl(avatarIconId)
}
