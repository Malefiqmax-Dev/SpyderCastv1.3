import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD') // Normalize special chars
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove non-word chars
    .replace(/--+/g, '-') // Replace multiple hyphens
}

async function main() {
  console.log("Starting CDN link migration (v2)...")

  // Update Movies
  const movieSources = await prisma.movieSource.findMany({
    include: { movie: true }
  })
  
  for (const source of movieSources) {
    if (source.movie) {
      const slug = slugify(source.movie.title)
      const newUrl = `https://cdn.fastflux.xyz/movies/VF/${slug}.mp4`
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
      const seriesSlug = slugify(episode.series.title)
      const season = episode.season // S01
      const epNum = `E${String(episode.episodeNumber).padStart(2, '0')}`
      // Pattern: https://cdn.fastflux.xyz/series/VF/Friends/S01/friends-S01-E01.mp4
      const filename = `${seriesSlug}-${season}-${epNum}`
      const newUrl = `https://cdn.fastflux.xyz/series/VF/${seriesSlug}/${season}/${filename}.mp4`
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
