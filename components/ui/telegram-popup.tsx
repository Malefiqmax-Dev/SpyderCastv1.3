"use client"

import { useState } from "react"
import { X } from "lucide-react"
import "./telegram-popup.css"

export function TelegramPopup() {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosed, setIsClosed] = useState(false)

  const handleClose = () => {
    setIsVisible(false)
    setIsClosed(true)
  }

  if (isClosed || !isVisible) return null

  return (
    <div className="telegram-popup-overlay">
      <div className="telegram-popup">
        <button className="telegram-popup-close" onClick={handleClose}>
          <X size={20} />
        </button>
        <div className="telegram-popup-content">
          <div className="telegram-icon">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
          </div>
          <h3 className="telegram-popup-title">Rejoins SpyderCast sur Telegram</h3>
          <p className="telegram-popup-text">
            Pour ne pas perdre l'accès au site et profiter des futures mises à jour
          </p>
          <a
            href="https://t.me/+yFM3VrrMyLRhZmQ0"
            target="_blank"
            rel="noopener noreferrer"
            className="telegram-popup-button"
          >
            Rejoindre
          </a>
        </div>
      </div>
    </div>
  )
}
