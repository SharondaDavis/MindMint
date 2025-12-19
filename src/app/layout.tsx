import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import type { ReactNode } from 'react'
import type { Viewport } from 'next'


const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'MindMint - Create Your Dream Reality',
    description: 'Use visualization to create your reality and explore legacy questions that reveal your true purpose',
    themeColor: '#000000',
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1.0.0",
        imageUrl: "https://mindmint.fun",
        button: {
          title: "Join the MindMint",
          action: {
            name: "Launch MindMint",
            url: "https://mindmint.fun"
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
        {children}
      </body>
    </html>
  )
}
