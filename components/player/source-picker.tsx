"use client"

import { useState } from "react"
import { Cloud, Globe, Sparkles, Wind, Zap, Play, Film, Tv, Monitor, Radio, Cast, Video, Layers, Star } from "lucide-react"
import {
  PLAYER_SOURCES,
  type PlayerSource,
  type PlayerSourceId,
  isExternalSource,
} from "@/lib/player-sources"
import "./source-picker.css"

const SOURCE_ICONS: Record<PlayerSourceId, typeof Cloud> = {
  eau: Cloud,
  terre: Globe,
  feu: Sparkles,
  eclair: Zap,
  peachify: Play,
  anyembed: Film,
  vidsrcwtf: Tv,
  nontongo: Radio,
  videasy: Cast,
  oneembed: Video,
  vidking: Play,
  twoembed: Layers,
  superflix: Star,
  dcp: Cloud,
}

type LanguageTab = "VF" | "VOSTFR" | "Multi"

interface SourcePickerProps {
  selectedId: PlayerSourceId
  onSelect: (id: PlayerSourceId) => void
  compact?: boolean
}

export function SourcePicker({ selectedId, onSelect, compact = false }: SourcePickerProps) {
  const [activeTab, setActiveTab] = useState<LanguageTab>("VF")

  const filteredSources = PLAYER_SOURCES.filter((source) => source.lang === activeTab)

  return (
    <div className={`source-picker ${compact ? "source-picker-compact" : ""}`}>
      <div className="source-picker-header">
        <p className="source-picker-title">Sources</p>
        <p className="source-picker-subtitle">Choisissez un lecteur</p>
      </div>

      <div className="source-picker-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("VF")}
          className={`source-picker-tab ${activeTab === "VF" ? "source-picker-tab-active" : ""}`}
        >
          VF
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("VOSTFR")}
          className={`source-picker-tab ${activeTab === "VOSTFR" ? "source-picker-tab-active" : ""}`}
        >
          VOSTFR
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Multi")}
          className={`source-picker-tab ${activeTab === "Multi" ? "source-picker-tab-active" : ""}`}
        >
          Multi
        </button>
      </div>

      <div className="source-picker-list">
        {filteredSources.map((source) => (
          <SourcePickerItem
            key={source.id}
            source={source}
            active={selectedId === source.id}
            onSelect={() => onSelect(source.id)}
          />
        ))}
      </div>
    </div>
  )
}

function SourcePickerItem({
  source,
  active,
  onSelect,
}: {
  source: PlayerSource
  active: boolean
  onSelect: () => void
}) {
  const Icon = SOURCE_ICONS[source.id]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`source-picker-item ${active ? "source-picker-item-active" : ""}`}
    >
      <span className="source-picker-item-icon-wrap">
        <Icon className="source-picker-item-icon" />
      </span>

      <span className="source-picker-item-copy">
        <span className="source-picker-item-top">
          <span className="source-picker-item-label">{source.label}</span>
          <span className={`source-picker-item-badge source-picker-item-badge-${source.lang.toLowerCase()}`}>
            {source.lang}
          </span>
        </span>
        <span className="source-picker-item-desc">{source.description}</span>
      </span>

      {isExternalSource(source) && (
        <span className="source-picker-item-tag">Externe</span>
      )}
    </button>
  )
}
