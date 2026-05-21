import { Footer } from "@/components/layout/footer"
import { MoviesClient } from "@/components/media/movies-client"
import { getPopularMovies } from "@/lib/tmdb"
import styles from "./page.module.css"

export const metadata = {
  title: "Films - SpyderCast",
  description: "Catalogue complet de films.",
}

export default async function MoviesPage() {
  const popular = await getPopularMovies(1)
  const popularItems = popular?.results ?? []

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Films</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>Parcourez notre catalogue complet</p>
        </div>

        <div className={styles.content}>
          <MoviesClient initialMovies={popularItems} />
        </div>
      </div>

      <Footer />
    </main>
  )
}
