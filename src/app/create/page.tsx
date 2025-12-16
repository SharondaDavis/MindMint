'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'

import { CosmicBackground } from '@/components/cosmic-background'
import { MomentSave } from '@/components/moment-save'
import { TimelineScrubber } from '@/components/timeline-scrubber'
import { MoodTemplates } from '@/components/mood-templates'
import { AffirmationRecorder } from '@/components/affirmation-recorder'
import { HighFrequencySounds } from '@/components/high-frequency-sounds'
import { PhotoManager } from '@/components/photo-manager'
import { WalletConnect } from '@/components/wallet-connect'
import { ZoraMinter } from '@/components/zora-minter'
import { useState, useEffect } from 'react'
import { getChronologicalPhotos, type StoredPhoto } from '@/lib/photo-storage'

const InductionMindMovieCanvas = dynamic(() => import('@/components/induction-mindmovie-canvas').then(mod => ({ default: mod.InductionMindMovieCanvas })), {
  ssr: false,
  loading: () => (
    <div className="aspect-video rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
      <div className="text-sm text-white/60">Loading canvas...</div>
    </div>
  )
})

export default function CreatePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; category: string }>>([])
  const [selectedMood, setSelectedMood] = useState<any>(null)
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null)

  // Load stored photos in chronological order
  useEffect(() => {
    const storedPhotos = getChronologicalPhotos()
    setPhotos(storedPhotos.map(p => ({
      id: p.id,
      url: p.url,
      category: p.category
    })))
  }, [])

  function handleMoodSelect(mood: any) {
    setSelectedMood(mood)
  }

  function handlePlay() {
    setIsPlaying(true)
  }

  function handlePause() {
    setIsPlaying(false)
  }

  function handleTimeChange(time: number) {
    setCurrentTime(time)
  }
  return (
    <CosmicBackground>
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Create Your Mind-Movie</h1>
                <p className="mt-1 text-sm text-white">
                  Build your personalized mind-movie with photos, affirmations, and healing frequencies
                </p>
              </div>
              <WalletConnect />
            </div>
          </div>

          {/* Photo Manager Section */}
          <div className="mt-8">
            <PhotoManager onPhotosChange={(updatedPhotos) => {
              setPhotos(updatedPhotos.map(p => ({
                id: p.id,
                url: p.url,
                category: p.category
              })))
            }} />
          </div>

          {/* Canvas Section */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <InductionMindMovieCanvas />
          </div>

          {/* Creative Controls */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <MoodTemplates compact={true} onTemplateSelect={handleMoodSelect} />
            </div>
            
            <div>
              <AffirmationRecorder compact={true} />
            </div>
          </div>

          <div className="mt-8">
            <HighFrequencySounds compact={true} />
          </div>

          {/* Zora NFT Minting Section */}
          <div className="mt-8">
            <ZoraMinter 
              account={connectedAccount || undefined}
              mindMovieData={{
                photos: photos.map(p => p.url),
                mood: selectedMood?.name || 'Neutral',
                soundFrequency: '528Hz', // Would come from selected sound
                affirmations: 'Personal affirmations' // Would come from recorder
              }}
            />
          </div>
        </div>
      </main>
    </CosmicBackground>
  )
}
