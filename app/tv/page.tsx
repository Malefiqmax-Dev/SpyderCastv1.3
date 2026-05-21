import { Footer } from "@/components/layout/footer"
import { SeriesClient } from "@/components/media/series-client"
import { getPopularTV } from "@/lib/tmdb"
import styles from "./page.module.css"

export const metadata = {
  title: "Series - SpyderCast",
  description: "Catalogue complet de series.",
}

export default async function TVPage() {
  const popular = await getPopularTV(1)
  const popularItems = popular?.results ?? []

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Series</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>Parcourez notre catalogue complet</p>
        </div>

        <div className={styles.content}>
          <SeriesClient initialSeries={popularItems} />
        </div>
      </div>

      <Footer />
    </main>
  )
}
