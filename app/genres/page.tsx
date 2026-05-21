import { getMovieGenres, discoverByGenre } from "@/lib/tmdb"
import { Footer } from "@/components/layout/footer"
import { GenreCard } from "./genre-card"
import "./genres.css"

export const metadata = {
  title: "Genres - SpyderCast",
  description: "Parcourez les films et series par genre.",
}

export default async function GenresPage() {
  const movieGenresRes = await getMovieGenres()
  const movieGenres = movieGenresRes.genres

  const usedBackdrops = new Set<string>()

  const genresWithImages = await Promise.all(
    movieGenres.map(async (genre: any) => {
      try {
        const discovery = await discoverByGenre("movie", genre.id, 1)
        const results = discovery.results || []
        
        // Essayer de trouver une image qui n'a pas encore été utilisée
        let selectedMovie = null
        for (let i = 0; i < Math.min(results.length, 10); i++) {
          const candidate = results[i]
          
          // Vérifier si l'image est valide et non utilisée
          // Note : On force l'évitement d'une image spécifique si nécessaire en ajoutant une condition
          if (candidate.backdrop_path && !usedBackdrops.has(candidate.backdrop_path) && 
              !(genre.id === 10749 && candidate.backdrop_path === "/1x9e0qWonw634NhIsRdvnneeqvN.jpg")) {
            selectedMovie = candidate
            usedBackdrops.add(candidate.backdrop_path)
            break
          }
        }

        return {
          ...genre,
          backdropPath: selectedMovie?.backdrop_path || null,
        }
      } catch (error) {
        return { ...genre, backdropPath: null }
      }
    })
  )

  return (
    <main className="genres-main">
      <div className="genres-wrapper">
        <div className="genres-header">
          <h1 className="genres-title">Explorer par Genre</h1>
          <div className="genres-divider" />
          <p className="genres-subtitle">Trouvez votre prochain coup de cœur parmi nos catégories</p>
        </div>

        <div className="genres-grid">
          {genresWithImages.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
