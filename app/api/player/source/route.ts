import { NextRequest, NextResponse } from "next/server"
import { fetchFastFluxSource } from "@/lib/fastflux"
import { prisma } from "@/lib/db"

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "0x4AAAAAACoR7Q28Q4Qkdq_R"

async function verifyTurnstile(token: string, ip?: string | null) {
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip || undefined,
      }),
    })
    const data = await res.json()
    return data.success
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tmdbId, mediaType, season, episode, turnstileToken, type } = body
    
    console.log("[API Player] Request received:", { tmdbId, mediaType, season, episode, type });

    if (!tmdbId || !mediaType) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 })
    }

    if (!turnstileToken) {
      return NextResponse.json({ error: "Vérification captcha requise." }, { status: 400 })
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]
    const isValid = await verifyTurnstile(turnstileToken, ip)
    if (!isValid) {
      return NextResponse.json({ error: "Vérification captcha échouée." }, { status: 403 })
    }

    let url: string | null = null;
    let contentType: string = "mp4";
    const numericTmdbId = typeof tmdbId === "string" ? parseInt(tmdbId) : tmdbId;

    if (type === "hls") {
      const hlsMovie = await prisma.hLSMovie.findUnique({
        where: { tmdbId: numericTmdbId }
      });
      url = hlsMovie?.url || null;
      contentType = "hls";
    } else if (mediaType === "movie") {
      const movie = await prisma.movie.findUnique({
        where: { tmdbId: numericTmdbId },
        include: { sources: true }
      });
      // Prefer high quality or first available
      url = movie?.sources[0]?.url || null;
    } else if (mediaType === "tv") {
      const seasonStr = `S${String(season || 1).padStart(2, '0')}`;
      const series = await prisma.series.findUnique({
        where: { tmdbId: numericTmdbId },
        include: { 
          episodes: {
            where: {
              season: seasonStr,
              episodeNumber: episode || 1
            }
          }
        }
      });
      url = series?.episodes[0]?.url || null;
    }

    if (!url) {
      console.log("[API Player] Source not found in DB, trying FastFlux fallback...");
      url = await fetchFastFluxSource(numericTmdbId, mediaType as "movie" | "tv", season, episode);
      if (url) {
        contentType = "hls";
        console.log("[API Player] FastFlux fallback success:", url);
      }
    }

    if (!url) {
      console.warn("[API Player] Source not found in database for:", { numericTmdbId, mediaType, type });
      return NextResponse.json({
        url: null,
        type: contentType,
        externalAvailable: true,
        message: "Source locale indisponible. Utilisez Feu ou Éclair.",
      })
    }

    console.log("[API Player] Success, returning URL:", url);
    return NextResponse.json({ url, type: contentType })
  } catch (error) {
    console.error("[API Player] Server Error:", error)
    return NextResponse.json({ 
      error: "Erreur serveur.", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
