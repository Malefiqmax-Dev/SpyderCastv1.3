"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Users, MessageSquare, X, Send, Play, Pause, Copy, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { toast } from "sonner"
import styles from "./watch-party-ui.module.css"

interface WatchPartyUIProps {
  mediaType: "movie" | "series"
  tmdbId: number
  season?: string
  episode?: number
  onSync?: (currentTime: number, isPlaying: boolean) => void
  onWatchPartyChange?: (watchPartyId: string | undefined) => void
}

interface WatchParty {
  id: string
  hostId: string
  mediaType: string
  tmdbId: number
  season: string | null
  episode: number | null
  currentTime: number
  isPlaying: boolean
  createdAt: string
  updatedAt: string
  participants: Participant[]
  messages: Message[]
}

interface Participant {
  id: string
  userId: string
  username: string
  avatar: string | null
  joinedAt: string
  lastSync: string
}

interface Message {
  id: string
  userId: string
  username: string
  avatar: string | null
  content: string
  createdAt: string
}

export function WatchPartyUI({ mediaType, tmdbId, season, episode, onSync, onWatchPartyChange }: WatchPartyUIProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [watchParty, setWatchParty] = useState<WatchParty | null>(null)
  const [loading, setLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showJoinInput, setShowJoinInput] = useState(false)
  const [joinCode, setJoinCode] = useState("")

  useEffect(() => {
    loadWatchParty()
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [mediaType, tmdbId, season, episode])

  useEffect(() => {
    onWatchPartyChange?.(watchParty?.id)
  }, [watchParty, onWatchPartyChange])

  useEffect(() => {
    if (watchParty) {
      startSync()
    }
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [watchParty])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadWatchParty() {
    if (!user) return
    setLoading(true)

    try {
      const res = await fetch("/api/watch-party", { cache: "no-store" })
      if (!res.ok) throw new Error("fetch_failed")

      const data = await res.json()
      if (data.watchParty) {
        setWatchParty(data.watchParty)
        setMessages(data.watchParty.messages || [])
      }
    } catch {
      // Ignore error - no active watch party
    } finally {
      setLoading(false)
    }
  }

  async function createWatchParty() {
    if (!user) return
    setLoading(true)

    try {
      const res = await fetch("/api/watch-party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaType, tmdbId, season, episode }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Impossible de créer la watch party")
        return
      }

      const data = await res.json()
      setWatchParty(data.watchParty)
      toast.success("Watch party créée !")
    } catch {
      toast.error("Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  async function joinWatchParty() {
    if (!user || !joinCode.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/watch-party/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchPartyId: joinCode.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Impossible de rejoindre la watch party")
        return
      }

      const data = await res.json()
      // Load the watch party details
      const partyRes = await fetch(`/api/watch-party?id=${joinCode.trim()}`)
      if (partyRes.ok) {
        const partyData = await partyRes.json()
        setWatchParty(partyData.watchParty)
        setMessages(partyData.watchParty.messages || [])
        toast.success("Rejoint la watch party !")
        setShowJoinInput(false)
        setJoinCode("")
      }
    } catch {
      toast.error("Erreur lors de la jonction")
    } finally {
      setLoading(false)
    }
  }

  async function leaveWatchParty() {
    if (!watchParty || !user) return
    setLoading(true)

    try {
      const res = await fetch("/api/watch-party/join", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchPartyId: watchParty.id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Impossible de quitter")
        return
      }

      setWatchParty(null)
      setMessages([])
      toast.success("Vous avez quitté la watch party")
    } catch {
      toast.error("Erreur")
    } finally {
      setLoading(false)
    }
  }

  async function copyWatchPartyCode() {
    if (!watchParty) return
    navigator.clipboard.writeText(watchParty.id)
    toast.success("Code copié !")
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!watchParty || !chatInput.trim() || !user) return

    try {
      const res = await fetch("/api/watch-party/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchPartyId: watchParty.id, content: chatInput }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Impossible d'envoyer")
        return
      }

      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setChatInput("")
    } catch {
      toast.error("Erreur")
    }
  }

  function startSync() {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }

    syncIntervalRef.current = setInterval(async () => {
      if (!watchParty) return

      try {
        const res = await fetch(`/api/watch-party/sync?id=${watchParty.id}`, { cache: "no-store" })
        if (!res.ok) return

        const data = await res.json()
        if (onSync) {
          onSync(data.currentTime, data.isPlaying)
        }

        // Also fetch new messages
        const chatRes = await fetch(`/api/watch-party/chat?id=${watchParty.id}&limit=50`, { cache: "no-store" })
        if (chatRes.ok) {
          const chatData = await chatRes.json()
          setMessages(chatData.messages || [])
        }
      } catch {
        // Ignore sync errors
      }
    }, 2000) // Sync every 2 seconds
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const [authModalOpen, setAuthModalOpen] = useState(false)

  // ... (dans le return)
  if (!user) {
    return (
      <>
        <button
          onClick={() => setAuthModalOpen(true)}
          className={styles.watchPartyCreateBtn}
        >
          <Users className={styles.watchPartyIcon} />
          Connectez-vous pour Watch Party
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    )
  }

  return (
    <div className={styles.watchPartyContainer}>
      {!watchParty ? (
        <>
          {showJoinInput ? (
            <div className={styles.watchPartyJoinForm}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Entrez le code de la watch party..."
                className={styles.watchPartyJoinInput}
              />
              <button
                onClick={joinWatchParty}
                disabled={loading || !joinCode.trim()}
                className={styles.watchPartyJoinSubmit}
              >
                {loading ? "Rejoint..." : "Rejoindre"}
              </button>
              <button
                onClick={() => setShowJoinInput(false)}
                className={styles.watchPartyCancelBtn}
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className={styles.watchPartyActions}>
              <button
                onClick={createWatchParty}
                disabled={loading}
                className={styles.watchPartyCreateBtn}
              >
                <Users className={styles.watchPartyIcon} />
                {loading ? "Création..." : "Créer une Watch Party"}
              </button>
              <button
                onClick={() => setShowJoinInput(true)}
                disabled={loading}
                className={styles.watchPartyJoinBtn}
              >
                Rejoindre
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.watchPartyPanel}>
          <div className={styles.watchPartyHeader}>
            <div className={styles.watchPartyInfo}>
              <Users className={styles.watchPartyIcon} />
              <span className={styles.watchPartyTitle}>Watch Party</span>
              <span className={styles.watchPartyParticipants}>
                {watchParty.participants?.length || 0} participant{(watchParty.participants?.length || 0) > 1 ? "s" : ""}
              </span>
            </div>
            <div className={styles.watchPartyActions}>
              <button
                onClick={copyWatchPartyCode}
                className={styles.watchPartyActionBtn}
                title="Copier le code"
              >
                <Copy className={styles.watchPartyActionIcon} />
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className={`${styles.watchPartyActionBtn} ${showChat ? styles.watchPartyActionActive : ""}`}
                title="Chat"
              >
                <MessageSquare className={styles.watchPartyActionIcon} />
              </button>
              <button
                onClick={leaveWatchParty}
                className={`${styles.watchPartyActionBtn} ${styles.watchPartyLeaveBtn}`}
                title="Quitter"
              >
                <LogOut className={styles.watchPartyActionIcon} />
              </button>
            </div>
          </div>

          {showChat && (
            <div className={styles.watchPartyChat}>
              <div className={styles.watchPartyMessages}>
                {messages.length === 0 ? (
                  <p className={styles.watchPartyEmpty}>Aucun message</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.watchPartyMessage} ${msg.userId === user.id ? styles.watchPartyMessageOwn : ""}`}
                    >
                      <img
                        src={msg.avatar || "https://static.crunchyroll.com/assets/avatar/170x170/0011-puck.png"}
                        alt={msg.username}
                        className={styles.watchPartyAvatar}
                      />
                      <div className={styles.watchPartyMessageContent}>
                        <span className={styles.watchPartyMessageUsername}>{msg.username}</span>
                        <p className={styles.watchPartyMessageText}>{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className={styles.watchPartyChatInput}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Écrire un message..."
                  className={styles.watchPartyInput}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className={styles.watchPartySendBtn}
                >
                  <Send className={styles.watchPartySendIcon} />
                </button>
              </form>
            </div>
          )}

          <div className={styles.watchPartyParticipantsList}>
            {watchParty.participants.map((p) => (
              <div key={p.id} className={styles.watchPartyParticipant}>
                <img
                  src={p.avatar || "https://static.crunchyroll.com/assets/avatar/170x170/0011-puck.png"}
                  alt={p.username}
                  className={styles.watchPartyParticipantAvatar}
                />
                <span className={styles.watchPartyParticipantName}>{p.username}</span>
                {p.userId === watchParty.hostId && (
                  <span className={styles.watchPartyHostBadge}>Hôte</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
