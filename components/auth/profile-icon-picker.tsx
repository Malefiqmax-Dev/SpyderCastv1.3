"use client"

import { PROFILE_ICONS } from "@/lib/profile-icons"
import "./profile-icon-picker.css"

interface ProfileIconPickerProps {
  selectedIconId: string
  onSelect: (iconId: string) => void
}

export function ProfileIconPicker({ selectedIconId, onSelect }: ProfileIconPickerProps) {
  return (
    <div className="profile-icon-picker">
      {PROFILE_ICONS.map((icon) => (
        <button
          key={icon.id}
          type="button"
          onClick={() => onSelect(icon.id)}
          className={`profile-icon-picker-item ${selectedIconId === icon.id ? "profile-icon-picker-item-active" : ""}`}
          title={icon.label}
        >
          <img src={icon.url} alt={icon.label} className="profile-icon-picker-image" />
        </button>
      ))}
    </div>
  )
}
