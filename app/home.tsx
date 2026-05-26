import { Footer } from "@/components/layout/footer"
import { HeroBanner } from "@/components/media/hero-banner"
import { MediaRow } from "@/components/media/media-row"
import { Top10 } from "@/components/media/top-10"
import { TelegramPopup } from "@/components/ui/telegram-popup"
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getPopularTV,
  getTopRatedTV,
  getMediaLogos,
} from "@/lib/tmdb"
import "./home.css"

export default async function HomePage() {
  const [trending, popularMovies, topRatedMovies, nowPlaying, popularTV, topRatedTV] =
    await Promise.allSettled([
      getTrending("all", "week"),
      getPopularMovies(),
      getTopRatedMovies(),
      getNowPlayingMovies(),
      getPopularTV(),
      getTopRatedTV(),
    ])

  const trendingItems =
    trending.status === "fulfilled" ? trending.value.results ?? [] : []
  const popularMovieItems =
    popularMovies.status === "fulfilled" ? popularMovies.value.results ?? [] : []
  const topRatedMovieItems =
    topRatedMovies.status === "fulfilled" ? topRatedMovies.value.results ?? [] : []
  const nowPlayingItems =
    nowPlaying.status === "fulfilled" ? nowPlaying.value.results ?? [] : []
  const popularTVItems =
    popularTV.status === "fulfilled" ? popularTV.value.results ?? [] : []
  const topRatedTVItems =
    topRatedTV.status === "fulfilled" ? topRatedTV.value.results ?? [] : []

  // Fetch logos for hero items
  const rawHeroItems = trendingItems.slice(0, 5)
  const heroItemsWithLogos = await Promise.all(
    rawHeroItems.map(async (item: any) => {
      const mediaType = item.media_type ?? "movie"
      const logos = await getMediaLogos(mediaType, item.id)
      
      // Filter logos: prefer French, then English, then no language
      const logo = 
        logos.find((l: any) => l.iso_639_1 === "fr") || 
        logos.find((l: any) => l.iso_639_1 === "en") || 
        logos[0]

      return {
        ...item,
        media_type: mediaType,
        logo_path: logo?.file_path || null,
      }
    })
  )

  const top10Movies = popularMovieItems.slice(0, 10)
  const top10TV = popularTVItems.slice(0, 10)

  return (
    <main className={"home-main"}>
      <TelegramPopup />

      {heroItemsWithLogos.length > 0 && <HeroBanner items={heroItemsWithLogos} />}

      <div className={"home-content"}>
        {top10Movies.length > 0 && (
          <Top10 title="Top 10 Films du moment" items={top10Movies} mediaType="movie" />
        )}

        {top10TV.length > 0 && (
          <Top10 title="Top 10 Series du moment" items={top10TV} mediaType="tv" />
        )}

        {trendingItems.length > 0 && (
          <MediaRow
            title="Tendances de la semaine"
            items={trendingItems.map((item: any) => ({
              ...item,
              media_type: item.media_type ?? "movie",
            }))}
          />
        )}

        {nowPlayingItems.length > 0 && (
          <MediaRow
            title="Films a l'affiche"
            items={nowPlayingItems.map((item: any) => ({ ...item, media_type: "movie" }))}
          />
        )}

        {popularTVItems.length > 0 && (
          <MediaRow
            title="Series populaires"
            items={popularTVItems.map((item: any) => ({ ...item, media_type: "tv" }))}
          />
        )}

        {topRatedMovieItems.length > 0 && (
          <MediaRow
            title="Films les mieux notes"
            items={topRatedMovieItems.map((item: any) => ({ ...item, media_type: "movie" }))}
          />
        )}

        {topRatedTVItems.length > 0 && (
          <MediaRow
            title="Series les mieux notees"
            items={topRatedTVItems.map((item: any) => ({ ...item, media_type: "tv" }))}
          />
        )}
      </div>

      <Footer />
    </main>
  )
}
