import { getMovieGenres, getTVGenres } from "./lib/tmdb";

async function checkGenres() {
  const movieGenres = await getMovieGenres();
  const tvGenres = await getTVGenres();
  
  console.log("Movie Genres:", JSON.stringify(movieGenres.genres.slice(0, 5), null, 2));
  console.log("TV Genres:", JSON.stringify(tvGenres.genres.slice(0, 5), null, 2));
}

checkGenres();
