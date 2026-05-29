import { PrismaClient } from "@prisma/client";
import { PLAYER_CONFIG } from "../constants/player";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function fetchPage(route: string, page: number) {
  const url = `${PLAYER_CONFIG.BASE_URL}?route=${route}&api_key=${PLAYER_CONFIG.API_KEY}&page=${page}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.json();
}

async function syncMovies() {
  console.log("Syncing Movies...");
  let page = 1;
  while (true) {
    const data = await fetchPage("movies", page);
    if (!data.success || !data.data || data.data.length === 0) break;
    
    for (const movie of data.data) {
      const m = await prisma.movie.upsert({
        where: { tmdbId: movie.tmdb_id },
        update: { title: movie.title },
        create: {
          id: randomUUID(),
          tmdbId: movie.tmdb_id,
          title: movie.title,
          year: movie.year || 2026,
          poster: movie.poster || ""
        },
      });

      // Use the actual source URL from API response
      if (movie.source && movie.source.url) {
        await prisma.movieSource.upsert({
          where: { id: `fastflux_${m.tmdbId}` },
          update: { 
            url: movie.source.url,
            quality: movie.source.quality || "1080p",
            language: movie.source.language || "VF",
            size: movie.source.size,
            sizeBytes: movie.source.size_bytes ? BigInt(movie.source.size_bytes) : null
          },
          create: { 
            id: `fastflux_${m.tmdbId}`, 
            movieId: m.id, 
            url: movie.source.url, 
            quality: movie.source.quality || "1080p",
            language: movie.source.language || "VF",
            size: movie.source.size,
            sizeBytes: movie.source.size_bytes ? BigInt(movie.source.size_bytes) : null
          },
        });
      }
    }
    if (data.pagination && page < data.pagination.total_pages) page++; else break;
  }
}

async function syncSeries() {
  console.log("Syncing Series...");
  let page = 1;
  while (true) {
    const data = await fetchPage("series", page);
    if (!data.success || !data.data || data.data.length === 0) break;
    
    for (const series of data.data) {
      const dbSeries = await prisma.series.upsert({
        where: { tmdbId: series.tmdb_id },
        update: { title: series.series_name },
        create: {
          id: randomUUID(),
          tmdbId: series.tmdb_id,
          title: series.series_name,
          seasonCount: series.season_count || 1,
          episodeCount: series.episode_count || 1
        },
      });

      for (const ep of series.episodes) {
        const epId = `ep_${dbSeries.tmdbId}_${ep.season}_${ep.episode_number}`;
        
        // Series episodes have url directly, not nested under source
        const epUrl = ep.url || null;
        const epSize = ep.size || null;
        const epLanguage = ep.language || "VF";

        // Check if episode exists
        const existing = await prisma.episode.findUnique({
          where: { id: epId }
        });

        if (existing) {
          if (epUrl) {
            await prisma.episode.update({
              where: { id: epId },
              data: {
                url: epUrl,
                size: epSize,
                language: epLanguage
              }
            });
          }
        } else {
          if (epUrl) {
            await prisma.episode.create({
              data: {
                id: epId,
                series: {
                  connect: { id: dbSeries.id }
                },
                season: String(ep.season),
                episodeNumber: ep.episode_number,
                url: epUrl,
                size: epSize,
                language: epLanguage
              }
            });
          }
        }
      }
    }
    if (data.pagination && page < data.pagination.total_pages) page++; else break;
  }
}

async function main() {
  await syncMovies();
  await syncSeries();
  await prisma.$disconnect();
}

main().catch(console.error);
