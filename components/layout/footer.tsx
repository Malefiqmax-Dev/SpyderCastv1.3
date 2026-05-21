import Link from "next/link"
import "./footer.css"

export function Footer() {
  return (
    <footer className="footer-footer">
      <div className="footer-inner">
        <Link href="/" className="footer-logo-link">
          <span className="footer-logo">
            Spyder<span className="footer-logo-accent">Cast</span>
          </span>
        </Link>
        <p className="footer-tagline">Votre plateforme de streaming pour films et series.</p>
        <div className="footer-links">
          <Link href="/" className="footer-link">Accueil</Link>
          <Link href="/movies" className="footer-link">Films</Link>
          <Link href="/tv" className="footer-link">Series</Link>
          <Link href="/genres" className="footer-link">Genres</Link>
          <Link href="/dmca" className="footer-link">DMCA</Link>
        </div>
        <p className="footer-copyright">
          {"SpyderCast"} {new Date().getFullYear()} Droits réservés
        </p>
      </div>
    </footer>
  )
}
