import { notFound } from "next/navigation"
import { getTVDetails, getImageUrl, getBackdropUrl } from "@/lib/tmdb"
import { Footer } from "@/components/layout/footer"
import { MediaRow } from "@/components/media/media-row"
import { TVDetailView } from "./tv-detail-view"
import styles from "./page.module.css"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  try {
    const show = await getTVDetails(Number(id))
    return {
      title: `${show.name} - SpyderCast`,
      description: show.overview,
      openGraph: {
        title: show.name,
        description: show.overview,
        images: [{ url: getImageUrl(show.poster_path, "w500") ?? "" }],
      },
    }
  } catch {
    return { title: "Serie - SpyderCast" }
  }
}

export default async function TVPage({ params }: PageProps) {
  const { id } = await params
  const numericId = Number(id)
  if (isNaN(numericId)) notFound()

  let show: any
  try {
    show = await getTVDetails(numericId)
  } catch {
    notFound()
  }

  const backdropUrl = getBackdropUrl(show.backdrop_path)
  const posterUrl = getImageUrl(show.poster_path, "w500")

  const similar =
    (show.similar?.results ?? [])
      .slice(0, 20)
      .map((item: any) => ({ ...item, media_type: "tv" }))

  const cast = (show.credits?.cast ?? []).slice(0, 10)
  const trailer = (show.videos?.results ?? []).find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube"
  )

  return (
    <main className={styles.main}>
      <TVDetailView
        show={show}
        backdropUrl={backdropUrl}
        posterUrl={posterUrl}
        cast={cast}
        trailerKey={trailer?.key ?? null}
      />

      {similar.length > 0 && (
        <div className={styles.similarSection}>
          <MediaRow title="Series similaires" items={similar} />
        </div>
      )}

      <Footer />
    </main>
  )
}
