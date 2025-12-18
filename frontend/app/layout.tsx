import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display, IBM_Plex_Sans, Barlow } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/lib/contexts/ThemeContext"
import "./globals.css"
import { Suspense } from "react"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
})

const ibmPlex = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-ibm-plex", weight: ["400", "600"] })
const barlow = Barlow({ subsets: ["latin"], variable: "--font-barlow", weight: ["400", "600"] })

export const metadata: Metadata = {
  title: "Pesa-Afrik - Pan-African Currency Exchange Platform",
  description: "Official African Currency Token (ACT) exchange platform. Real-time rates for 13+ African currencies.",
  keywords:
    "African currency exchange, ACT token, Pan-African payments, blockchain Africa, cross-border payments, Stellar blockchain, African fintech",
  authors: [{ name: "Pesa-Afrik Team" }],
  openGraph: {
    title: "Pesa-Afrik - Pan-African Currency Exchange",
    description: "Official African Currency Token (ACT) exchange platform. Real-time rates for 13+ African currencies.",
    type: "website",
    locale: "en_US",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark theme-binance">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${playfair.variable} ${ibmPlex.variable} ${barlow.variable} antialiased`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            {children}
            <Toaster />
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
