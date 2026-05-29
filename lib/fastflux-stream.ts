import { PLAYER_CONFIG } from "@/constants/player";

export async function fetchFastFluxStream(
  tmdbId: number,
  mediaType: "movie" | "tv",
  season?: number,
  episode?: number
): Promise<string | null> {
  const route = mediaType === "movie" 
    ? `movies/${tmdbId}/player` 
    : `series/${tmdbId}/player?season=${season ?? 1}&episode=${episode ?? 1}`;
  
  const url = `${PLAYER_CONFIG.BASE_URL}?route=${route}&api_key=${PLAYER_CONFIG.API_KEY}`;
  
  try {
    const res = await fetch(url);
    const content = await res.text();
    
    // Attempt to extract MP4/HLS links from the response
    const match = content.match(/(https?:\/\/[^\s"'<]+?\.(mp4|m3u8))/i);
    return match ? match[0] : null;
  } catch (error) {
    console.error("FastFlux Stream Error:", error);
    return null;
  }
}
