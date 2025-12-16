import Link from 'next/link'
import { ArrowLeft, Image } from 'lucide-react'

import { CosmicBackground } from '@/components/cosmic-background'

export default function GalleryPage() {
  return (
    <CosmicBackground>
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <Image className="h-6 w-6 text-white/80" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Gallery</h1>
                <p className="mt-1 text-sm text-white">Saved mind-movies and sessions will live here.</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white">
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No mind-movies yet</h3>
              <p className="text-sm text-white/60 mb-6">
                Create your first mind-movie to see it here
              </p>
              <Link 
                href="/create"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/20"
              >
                Create Your First Mind-Movie
              </Link>
            </div>
          </div>
          </div>
        </div>
      </main>
    </CosmicBackground>
  )
}
