/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "static.crunchyroll.com",
      },
      {
        protocol: "https",
        hostname: "imgs.search.brave.com",
      },
      {
        protocol: "https",
        hostname: "fastflux.xyz",
      },
      {
        protocol: "https",
        hostname: "cdn.fastflux.xyz",
      },
    ],
  },
  // Désactivation explicite de headers de sécurité si Next.js en injecte par défaut
  async headers() {
    return [];
  },
}

export default nextConfig
