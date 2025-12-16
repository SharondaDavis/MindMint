'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { UploadFlow } from '@/components/upload-flow'
import { CosmicBackground } from '@/components/cosmic-background'

export default function UploadPage() {
  return (
    <CosmicBackground>
      <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="text-sm text-white">Max 10MB per image</div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <UploadFlow compact={false} />

          <aside className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 backdrop-blur">
            <h2 className="text-base font-semibold text-white">How MindMint uses these</h2>
            <div className="mt-4 space-y-4 text-sm text-white">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-medium text-white">Past</div>
                <div className="mt-1">Memory anchors and motifs.</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-medium text-white">Present</div>
                <div className="mt-1">Your current baseline and mood palette.</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-medium text-white">Future</div>
                <div className="mt-1">A visual intention-set for what's next.</div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-medium text-white">Next</div>
              <p className="mt-1 text-sm text-white">After upload, you'll generate your kaleidoscope mind-movie.</p>
              <div className="mt-3">
                <Link href="/create" className="text-sm font-medium text-fuchsia-300 hover:text-fuchsia-200">
                  Go to Create
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
      </main>
    </CosmicBackground>
  )
}
