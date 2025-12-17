import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import type { ReactNode } from 'react'
import type { Viewport } from 'next'
import { CSP_HEADERS } from '@/lib/security'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'MindMint - Create Your Dream Reality',
  description: 'Use visualization to create your reality and explore legacy questions that reveal your true purpose',
  themeColor: '#000000',
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
        {Object.entries(CSP_HEADERS).map(([key, value]) => (
          <meta key={key} httpEquiv={key} content={value} />
        ))}
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        {children}
      </body>
    </html>
  )
}
