import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import type { ReactNode } from 'react'
import type { Viewport } from 'next'
import { MiniappReady } from '@/components/miniapp-ready'
import { AnalyticsProvider } from '@/components/analytics-provider'


const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'MindMint - Daily Aura Reset',
    description: 'A 60-second daily aura reset: breathe, spin, and receive guidance plus an affirmation.',
    other: {
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: "https://mindmint.fun/hero.png",
        button: {
          title: "Launch MindMint",
          action: {
            type: "launch_miniapp",
            name: "MindMint",
            url: "https://mindmint.fun/app",
            splashImageUrl: "https://mindmint.fun/splash.png",
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="base:app_id" content="69400b49d19763ca26ddc309" />
       
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <MiniappReady />
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  )
}
