import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkData() {
    const movie = await prisma.movie.findFirst({ include: { sources: true } });
    if (movie) {
        console.log("Movie found:", movie.title, movie.tmdbId);
        console.log("Sources:", movie.sources);
    } else {
        console.log("No movies in DB.");
    }

    const series = await prisma.series.findFirst({ include: { episodes: true } });
    if (series) {
        console.log("Series found:", series.title, series.tmdbId);
        console.log("Episodes sample:", series.episodes.slice(0, 2));
    } else {
        console.log("No series in DB.");
    }
}

checkData().finally(() => prisma.$disconnect());
