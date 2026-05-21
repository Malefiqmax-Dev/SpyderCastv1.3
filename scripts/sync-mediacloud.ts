import { PrismaClient } from "@prisma/client";
import { mediaApi } from "../lib/mediacloud";

const prisma = new PrismaClient();

async function syncMovies() {
  console.log("Syncing Movies...");
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const result = await mediaApi.getMovies(page, 100);
      if (!result.success || !result.data || result.data.length === 0) break;

      for (const movie of result.data) {
        try {
          await prisma.movie.upsert({
            where: { tmdbId: movie.tmdb_id },
            update: {
              id: movie.id, // Update internal ID if it changed
              title: movie.title,
              year: movie.year,
              poster: movie.poster,
              updatedAt: new Date(),
            },
            create: {
              id: movie.id,
              tmdbId: movie.tmdb_id,
              title: movie.title,
              year: movie.year,
              poster: movie.poster,
            },
          });

          // Sync source
          // Use movie.id + "_src" as a unique source ID for this movie instance
          await prisma.movieSource.upsert({
            where: { id: movie.id + "_src" },
            update: {
              movieId: movie.id,
              url: movie.source.url,
              quality: movie.source.quality,
              language: movie.source.language,
              size: movie.source.size,
              sizeBytes: movie.source.size_bytes ? BigInt(movie.source.size_bytes) : null,
            },
            create: {
              id: movie.id + "_src",
              movieId: movie.id,
              url: movie.source.url,
              quality: movie.source.quality,
              language: movie.source.language,
              size: movie.source.size,
              sizeBytes: movie.source.size_bytes ? BigInt(movie.source.size_bytes) : null,
            },
          });
        } catch (e) {
          console.error(`Failed to upsert movie ${movie.tmdb_id}:`, e instanceof Error ? e.message : e);
        }
      }

      if (result.pagination && page >= result.pagination.total_pages) {
        hasMore = false;
      } else if (!result.pagination) {
        hasMore = false;
      } else {
        page++;
      }
    }
    console.log("Movies synced.");
  } catch (error) {
    console.error("Error syncing movies:", error);
  }
}

async function syncSeries() {
  console.log("Syncing Series...");
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const result = await mediaApi.getSeries(page, 50);
      if (!result.success || !result.data || result.data.length === 0) break;

      for (const series of result.data) {
        try {
          const dbSeries = await prisma.series.upsert({
            where: { tmdbId: series.tmdb_id },
            update: {
              title: series.series_name,
              seasonCount: series.season_count,
              episodeCount: series.episode_count,
              updatedAt: new Date(),
            },
            create: {
              tmdbId: series.tmdb_id,
              title: series.series_name,
              seasonCount: series.season_count,
              episodeCount: series.episode_count,
            },
          });

          // Sync episodes
          for (const ep of series.episodes) {
            // Create a unique deterministic ID for the episode to avoid duplicates
            const epId = `ep_${dbSeries.tmdbId}_${ep.season}_${ep.episode_number}_${ep.language.toLowerCase()}`;
            await prisma.episode.upsert({
              where: { id: epId },
              update: {
                url: ep.url,
                size: ep.size,
                language: ep.language,
              },
              create: {
                id: epId,
                seriesId: dbSeries.id,
                season: ep.season,
                episodeNumber: ep.episode_number,
                url: ep.url,
                size: ep.size,
                language: ep.language,
              },
            });
          }
        } catch (e) {
          console.error(`Failed to upsert series ${series.tmdb_id}:`, e instanceof Error ? e.message : e);
        }
      }

      if (result.pagination && page >= result.pagination.total_pages) {
        hasMore = false;
      } else if (!result.pagination) {
        hasMore = false;
      } else {
        page++;
      }
    }
    console.log("Series synced.");
  } catch (error) {
    console.error("Error syncing series:", error);
  }
}

async function syncHLS() {
  console.log("Syncing HLS Movies...");
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const result = await mediaApi.getHLSMovies(page, 100);
      if (!result.success || !result.data || result.data.length === 0) break;

      for (const hls of result.data) {
        try {
          await prisma.hLSMovie.upsert({
            where: { tmdbId: hls.tmdb_id },
            update: {
              id: hls.id,
              title: hls.title,
              poster: hls.poster,
              url: hls.source.url,
              type: hls.source.type,
              size: hls.source.size,
              sizeBytes: hls.source.size_bytes ? BigInt(hls.source.size_bytes) : null,
              updatedAt: new Date(),
            },
            create: {
              id: hls.id,
              tmdbId: hls.tmdb_id,
              title: hls.title,
              poster: hls.poster,
              url: hls.source.url,
              type: hls.source.type,
              size: hls.source.size,
              sizeBytes: hls.source.size_bytes ? BigInt(hls.source.size_bytes) : null,
            },
          });
        } catch (e) {
          console.error(`Failed to upsert HLS ${hls.tmdb_id}:`, e instanceof Error ? e.message : e);
        }
      }

      if (result.pagination && page >= result.pagination.total_pages) {
        hasMore = false;
      } else if (!result.pagination) {
        hasMore = false;
      } else {
        page++;
      }
    }
    console.log("HLS synced.");
  } catch (error) {
    console.error("Error syncing HLS:", error);
  }
}

async function syncStats() {
  console.log("Syncing Stats...");
  try {
    const stats: any = await mediaApi.getCatalogStats();
    if (stats) {
      // Correctly map from root properties returned by API
      await prisma.catalogStats.upsert({
        where: { id: 1 },
        update: {
          totalMovies: stats.total_movies || 0,
          totalSeries: stats.total_series || 0,
          totalHLS: stats.total_hls || 0,
          updatedAt: new Date(),
        },
        create: {
          id: 1,
          totalMovies: stats.total_movies || 0,
          totalSeries: stats.total_series || 0,
          totalHLS: stats.total_hls || 0,
        },
      });
      console.log("Stats synced.");
    }
  } catch (e) {
    console.error("Failed to sync stats", e);
  }
}

async function main() {
  await syncMovies();
  await syncSeries();
  await syncHLS();
  await syncStats();
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
