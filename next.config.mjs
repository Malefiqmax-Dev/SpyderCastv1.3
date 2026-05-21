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
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self' https://challenges.cloudflare.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; img-src 'self' data: https:; frame-src 'self' https://challenges.cloudflare.com https://vidfast.pro https://wwembed.wavewatch.top https://livewatch.top; child-src 'self' https://challenges.cloudflare.com https://vidfast.pro https://wwembed.wavewatch.top https://livewatch.top; worker-src 'self' blob: https://challenges.cloudflare.com; connect-src *; font-src 'self' data:; media-src * blob: https://fastflux.xyz https://cdn.fastflux.xyz;",
          },
        ],
      },
    ];
  },
}

export default nextConfig
