import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

async function main() {
  console.log("Starting CDN link migration...")

  // Update Movies
  const movieSources = await prisma.movieSource.findMany({
    include: { movie: true }
  })
  
  for (const source of movieSources) {
    if (source.movie) {
      const title = source.movie.title.replace(/\s+/g, '_')
      const newUrl = `https://cdn.fastflux.xyz/movies/VF/${title}.mp4`
      await prisma.movieSource.update({
        where: { id: source.id },
        data: { url: newUrl }
      })
      console.log(`Updated Movie: ${source.movie.title} -> ${newUrl}`)
    }
  }

  // Update Episodes
  const episodes = await prisma.episode.findMany({
    include: { series: true }
  })

  for (const episode of episodes) {
    if (episode.series) {
      const seriesTitle = episode.series.title.replace(/\s+/g, '_')
      const season = episode.season // S01
      const epNum = `E${String(episode.episodeNumber).padStart(2, '0')}`
      const newUrl = `https://cdn.fastflux.xyz/series/VF/${seriesTitle}/${season}/${seriesTitle}-${season}-${epNum}.mp4`
      await prisma.episode.update({
        where: { id: episode.id },
        data: { url: newUrl }
      })
      console.log(`Updated Episode: ${episode.series.title} ${season} ${epNum} -> ${newUrl}`)
    }
  }

  console.log("Migration complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
