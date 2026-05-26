"use client"

import { PLAYER_SOURCES, type PlayerSource, type PlayerSourceId } from "@/lib/player-sources"
import "./premium-source-picker.css"

interface PremiumSourcePickerProps {
  selectedId: PlayerSourceId
  onSelect: (id: PlayerSourceId) => void
}

export function PremiumSourcePicker({ selectedId, onSelect }: PremiumSourcePickerProps) {
  const vfSources = PLAYER_SOURCES.filter(s => s.lang === "VF")
  const vostfrSources = PLAYER_SOURCES.filter(s => s.lang === "VOSTFR")
  const multiSources = PLAYER_SOURCES.filter(s => s.lang === "Multi")

  const getFlag = (lang: string) => {
    if (lang === "VF") return "🇫🇷"
    if (lang === "VOSTFR") return "🇬🇧"
    if (lang === "Multi") return "🌍"
    return ""
  }

  return (
    <div className="premium-source-picker">
      {/* Header */}
      <div className="premium-source-picker-header">
        <span className="premium-source-picker-title">{PLAYER_SOURCES.length} lecteurs disponibles</span>
      </div>

      {/* Ad blocker message */}
      <div className="premium-source-picker-adblock-message">
        Nous ne sommes pas responsables des pubs à l'intérieur des lecteurs
      </div>

      {/* VF Section */}
      {vfSources.length > 0 && (
        <div className="premium-source-picker-section">
          <div className="premium-source-picker-section-title">
            LECTEURS VF <span className="premium-source-picker-count">{vfSources.length}</span>
          </div>
          <div className="premium-source-picker-section-content">
            {vfSources.map((source) => (
              <div
                key={source.id}
                className={`premium-source-picker-item ${selectedId === source.id ? 'premium-source-picker-item-active' : ''}`}
                onClick={() => onSelect(source.id)}
              >
                <div className="premium-source-picker-item-left">
                  <span className="premium-source-picker-flag">{getFlag(source.lang)}</span>
                  <span className="premium-source-picker-item-label">{source.label}</span>
                  <span className="premium-source-picker-item-hd">HD</span>
                </div>
                <div className="premium-source-picker-item-badge">VF</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VOSTFR Section */}
      {vostfrSources.length > 0 && (
        <div className="premium-source-picker-section">
          <div className="premium-source-picker-section-title">
            LECTEURS VOSTFR <span className="premium-source-picker-count">{vostfrSources.length}</span>
          </div>
          <div className="premium-source-picker-section-content">
            {vostfrSources.map((source) => (
              <div
                key={source.id}
                className={`premium-source-picker-item ${selectedId === source.id ? 'premium-source-picker-item-active' : ''}`}
                onClick={() => onSelect(source.id)}
              >
                <div className="premium-source-picker-item-left">
                  <span className="premium-source-picker-flag">{getFlag(source.lang)}</span>
                  <span className="premium-source-picker-item-label">{source.label}</span>
                  <span className="premium-source-picker-item-hd">HD</span>
                </div>
                <div className="premium-source-picker-item-badge">VOSTFR</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi Section */}
      {multiSources.length > 0 && (
        <div className="premium-source-picker-section">
          <div className="premium-source-picker-section-title">
            LECTEURS MULTI <span className="premium-source-picker-count">{multiSources.length}</span>
          </div>
          <div className="premium-source-picker-section-content">
            {multiSources.map((source) => (
              <div
                key={source.id}
                className={`premium-source-picker-item ${selectedId === source.id ? 'premium-source-picker-item-active' : ''}`}
                onClick={() => onSelect(source.id)}
              >
                <div className="premium-source-picker-item-left">
                  <span className="premium-source-picker-flag">{getFlag(source.lang)}</span>
                  <span className="premium-source-picker-item-label">{source.label}</span>
                  <span className="premium-source-picker-item-hd">HD</span>
                </div>
                <div className="premium-source-picker-item-badge">MULTI</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
