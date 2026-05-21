/**
 * Builds the VidFast source URL according to the specified parameters.
 */
export interface VidFastOptions {
  tmdbId: number | string;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  autoPlay?: boolean;
  theme?: string;
  nextButton?: boolean;
  autoNext?: boolean;
}

export function buildVidFastUrl(options: VidFastOptions): string {
  const { tmdbId, mediaType, season, episode, autoPlay = true, theme = "16A085", nextButton = true, autoNext = true } = options;
  const baseUrl = "https://vidfast.pro";
  
  let url = "";
  if (mediaType === "movie") {
    url = `${baseUrl}/movie/${tmdbId}`;
  } else {
    const seasonNum = season ?? 1
    const episodeNum = episode ?? 1
    url = `${baseUrl}/tv/${tmdbId}/${seasonNum}/${episodeNum}`;
  }

  const params = new URLSearchParams({
    autoPlay: String(autoPlay),
    sub: "fr", // VOSTFR requirement
    theme: theme,
  });

  if (mediaType === "tv") {
    params.append("nextButton", String(nextButton));
    params.append("autoNext", String(autoNext));
  }

  return `${url}?${params.toString()}`;
}
