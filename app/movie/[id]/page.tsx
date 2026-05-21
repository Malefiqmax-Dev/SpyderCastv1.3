import { notFound } from "next/navigation"
import { getMovieDetails, getImageUrl, getBackdropUrl } from "@/lib/tmdb"
import { Footer } from "@/components/layout/footer"
import { MediaRow } from "@/components/media/media-row"
import { MovieDetailView } from "./movie-detail-view"
import styles from "./page.module.css"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  try {
    const movie = await getMovieDetails(Number(id))
    return {
      title: `${movie.title} - SpyderCast`,
      description: movie.overview,
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: [{ url: getImageUrl(movie.poster_path, "w500") ?? "" }],
      },
    }
  } catch {
    return { title: "Film - SpyderCast" }
  }
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params
  const numericId = Number(id)
  if (isNaN(numericId)) notFound()

  let movie: any
  try {
    movie = await getMovieDetails(numericId)
  } catch {
    notFound()
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path)
  const posterUrl = getImageUrl(movie.poster_path, "w500")

  const similar =
    (movie.similar?.results ?? [])
      .slice(0, 20)
      .map((item: any) => ({ ...item, media_type: "movie" }))

  const cast = (movie.credits?.cast ?? []).slice(0, 10)
  const trailer = (movie.videos?.results ?? []).find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube"
  )

  return (
    <main className={styles.main}>
      <MovieDetailView
        movie={movie}
        backdropUrl={backdropUrl}
        posterUrl={posterUrl}
        cast={cast}
        trailerKey={trailer?.key ?? null}
      />

      {similar.length > 0 && (
        <div className={styles.similarSection}>
          <MediaRow title="Films similaires" items={similar} />
        </div>
      )}

      <Footer />
    </main>
  )
}
