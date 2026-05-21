"use client"

import { useAuth } from "@/components/auth/auth-context"
import { Footer } from "@/components/layout/footer"
import { MediaCard } from "@/components/media/media-card"
import { Bookmark, Eye, Heart, Lock, Loader2 } from "lucide-react"
import { useState } from "react"
import styles from "./page.module.css"

type Tab = "watchLater" | "watched" | "liked"

export default function MyListPage() {
  const { user, isLoading, watchLaterItems, watchedItems, likedItems } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("watchLater")

  const tabs: { id: Tab; label: string; icon: typeof Bookmark; items: typeof watchLaterItems }[] = [
    { id: "watchLater", label: "A regarder", icon: Bookmark, items: watchLaterItems },
    { id: "watched", label: "Vus", icon: Eye, items: watchedItems },
    { id: "liked", label: "Aimes", icon: Heart, items: likedItems },
  ]

  const activeItems = tabs.find((t) => t.id === activeTab)?.items ?? []

  if (isLoading) {
    return (
      <main className={styles.loadingMain}>
        <Loader2 className={styles.loader} />
      </main>
    )
  }

  if (!user) {
    return (
      <main className={styles.main}>
        <div className={styles.authWrap}>
          <div className={styles.authIconWrap}>
            <Lock className={styles.authIcon} />
          </div>
          <h1 className={styles.authTitle}>Connexion requise</h1>
          <p className={styles.authText}>
            Connectez-vous pour acceder a votre liste personnelle de films et series.
          </p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Ma Liste</h1>
          <p className={styles.greeting}>
            Bonjour{" "}
            <span className={styles.username} style={{ color: user.nameColor }}>
              {user.username}
            </span>
            , retrouvez votre contenu prefere ici.
          </p>
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive
              }`}
            >
              <tab.icon className={styles.tabIcon} />
              {tab.label}
              <span
                className={`${styles.tabBadge} ${
                  activeTab === tab.id ? styles.tabBadgeActive : styles.tabBadgeInactive
                }`}
              >
                {tab.items.length}
              </span>
            </button>
          ))}
        </div>

        {activeItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              {(() => {
                const Icon = tabs.find((t) => t.id === activeTab)?.icon ?? Bookmark
                return <Icon className={styles.emptyIcon} />
              })()}
            </div>
            <p className={styles.emptyTitle}>Aucun contenu ici</p>
            <p className={styles.emptySubtitle}>
              Explorez des films et series et ajoutez-les a votre liste.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {activeItems.map((item) => (
              <MediaCard
                key={`${item.type}-${item.id}`}
                id={item.id}
                title={item.title}
                posterPath={item.poster_path}
                voteAverage={item.vote_average}
                mediaType={item.type}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
