import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Providers } from "@/components/layout/providers"
import { PremiumNavbar } from "@/components/layout/premium-navbar"
import { Toaster } from "sonner"
import "@/styles/index.css"
import "./root-layout.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "SpyderCast - La référence pour vos films et vos series",
  description:
    "Regardez les meilleurs films et series en streaming HD, suivez vos sports en direct.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "SpyderCast - La référence pour vos films et vos series",
    description: "Regardez les meilleurs films et series en streaming HD",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceGrotesk.variable} root-layout-html`}
    >
      <body className={"root-layout-body"}>
        <Providers>
          <PremiumNavbar />
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
