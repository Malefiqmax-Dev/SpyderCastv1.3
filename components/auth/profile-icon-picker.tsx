"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import { PROFILE_ICONS, type ProfileIcon } from "@/lib/profile-icons"
import "./profile-icon-picker.css"

interface ProfileIconPickerProps {
  selectedIconId: string
  onSelect: (iconId: string) => void
}

const CATEGORIES: { id: ProfileIcon["category"] | "all"; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "spydercast", label: "SpyderCast" },
  { id: "anime", label: "Anime" },
  { id: "hero", label: "Heroes" },
]

export function ProfileIconPicker({ selectedIconId, onSelect }: ProfileIconPickerProps) {
  return (
    <div className="profile-icon-picker">
      <p className="profile-icon-picker-help">1 profil = 1 icone. Choisissez celle qui vous represente.</p>
      <div className="profile-icon-picker-grid">
        {PROFILE_ICONS.map((icon) => (
          <button
            key={icon.id}
            type="button"
            onClick={() => onSelect(icon.id)}
            className={`profile-icon-picker-btn ${selectedIconId === icon.id ? "profile-icon-picker-btn-active" : ""}`}
            aria-label={`Choisir l'icone ${icon.label}`}
            title={icon.label}
          >
            <Image
              src={icon.url}
              alt={icon.label}
              fill
              sizes="64px"
              className="profile-icon-picker-image"
            />
            {selectedIconId === icon.id && (
              <span className="profile-icon-picker-check">
                <Check className="profile-icon-picker-check-icon" />
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="profile-icon-picker-selected">
        Icone selectionnee : <strong>{PROFILE_ICONS.find((icon) => icon.id === selectedIconId)?.label ?? "SpyderCast"}</strong>
      </p>
    </div>
  )
}
