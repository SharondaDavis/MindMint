'use client'

import { Upload, Sparkles, Heart, Brain, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CosmicBackground } from '@/components/cosmic-background'
import { UploadFlow } from '@/components/upload-flow'
import { ProgressBar } from '@/components/progress-bar'
import { LegacyQuestions } from '@/components/legacy-questions'
import { VisualizationExercises } from '@/components/visualization-exercises'
import { WalletConnector } from '@/components/wallet-connector'
import { DreamMinter } from '@/components/dream-minter'
import { NFTGallery } from '@/components/nft-gallery'
import { ErrorBoundary } from '@/components/error-boundary'
import dynamic from 'next/dynamic'

const InductionMindMovieCanvas = dynamic(() => import('@/components/induction-mindmovie-canvas').then(mod => ({ default: mod.InductionMindMovieCanvas })), {
  ssr: false,
  loading: () => (
    <div className="aspect-video rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
      <div className="text-sm text-white/60">Loading canvas...</div>
    </div>
  )
})

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)

  const handleWalletConnect = (address: string, chainId: string) => {
    setWalletAddress(address)
    setChainId(chainId)
  }

  const handleWalletDisconnect = () => {
    setWalletAddress(null)
    setChainId(null)
  }

  return (
    <CosmicBackground>
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-16">
          <header className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300/80 shadow-[0_0_18px_rgba(217,70,239,0.55)]" />
              Mint your dream reality on <span className="font-semibold text-white">Base</span>
            </div>

            <nav className="hidden items-center gap-5 text-sm text-white md:flex">
              <Link href="#legacy" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0">
                Legacy
              </Link>
              <Link href="#visualization" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0">
                Visualization
              </Link>
              <Link href="#mint" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0">
                Mint
              </Link>
              <Link href="#gallery" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0">
                Gallery
              </Link>
            </nav>
          </header>

          <section className="mt-12 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                Mint your
                <span className="block bg-gradient-to-r from-fuchsia-200 via-sky-200 to-violet-200 bg-clip-text text-transparent">
                  dream reality.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white sm:text-lg">
                Use visualization to create your reality and explore legacy questions that reveal your true "why."
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#mint"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_18px_60px_rgba(56,189,248,0.15)] transition hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0"
                >
                  <Wallet className="h-4 w-4" />
                  Mint on Base
                </Link>
                <Link
                  href="#visualization"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/60 focus-visible:ring-offset-0"
                >
                  <Brain className="h-4 w-4" />
                  Visualize reality
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-xs text-white">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">No account needed to explore</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">Base L2 • Low gas fees</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">NFT dream boards</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-fuchsia-500/20 via-sky-500/10 to-violet-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="text-sm font-medium text-white">Your purpose journey</div>
                    <div className="mt-1 text-xs text-white">Legacy questions + visualization exercises</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    href="#legacy"
                    className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/85">
                          <Heart className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Legacy questions</div>
                          <div className="mt-0.5 text-xs text-white">Explore your deeper purpose</div>
                        </div>
                      </div>
                      <span className="text-xs text-white transition group-hover:text-white">→</span>
                    </div>
                  </Link>

                  <Link
                    href="#visualization"
                    className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/60 focus-visible:ring-offset-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/85">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Visualization exercises</div>
                          <div className="mt-0.5 text-xs text-white">Create your desired reality</div>
                        </div>
                      </div>
                      <span className="text-xs text-white transition group-hover:text-white">→</span>
                    </div>
                  </Link>

                  <Link
                    href="#upload"
                    className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60 focus-visible:ring-offset-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/85">
                          <Upload className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Upload photos</div>
                          <div className="mt-0.5 text-xs text-white">Create your mind movie</div>
                        </div>
                      </div>
                      <span className="text-xs text-white transition group-hover:text-white">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Your Purpose Journey</h2>
              <p className="mt-2 text-sm text-white">Explore legacy questions and visualization exercises</p>
            </div>
            <ProgressBar 
              steps={[
                { id: 'legacy', label: 'Legacy Questions', status: 'active' },
                { id: 'visualization', label: 'Visualization', status: 'pending' },
                { id: 'create', label: 'Create Reality', status: 'pending' }
              ]}
              currentStep="legacy"
            />
          </section>

          <section id="legacy" className="mt-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Explore Your Legacy</h2>
              <p className="mt-2 text-sm text-white">Answer profound questions to reconnect with your deeper purpose</p>
            </div>
            <div className="mt-6">
              <LegacyQuestions compact={true} />
            </div>
          </section>

          <section id="visualization" className="mt-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Visualization Exercises</h2>
              <p className="mt-2 text-sm text-white">Guided meditations to help you create your desired reality</p>
            </div>
            <div className="mt-6">
              <VisualizationExercises compact={true} />
            </div>
          </section>

          <section id="mint" className="mt-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Mint Your Dream Board</h2>
              <p className="mt-2 text-sm text-white">Create an NFT of your dream reality on Base</p>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <ErrorBoundary>
                <WalletConnector 
                  onConnect={handleWalletConnect}
                  onDisconnect={handleWalletDisconnect}
                />
              </ErrorBoundary>
              {walletAddress && (
                <ErrorBoundary>
                  <DreamMinter
                    walletAddress={walletAddress}
                    dreamBoard={{
                      name: 'My Dream Reality',
                      description: 'A vision board representing my future aspirations and goals',
                      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                      categories: ['dreams', 'vision', 'manifestation']
                    }}
                  />
                </ErrorBoundary>
              )}
            </div>
          </section>

          <section id="gallery" className="mt-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Your Dream Gallery</h2>
              <p className="mt-2 text-sm text-white">View your minted dream board NFTs</p>
            </div>
            <div className="mt-6">
              <ErrorBoundary>
                <NFTGallery walletAddress={walletAddress || undefined} />
              </ErrorBoundary>
            </div>
          </section>

          <section id="upload" className="mt-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Upload your photos</h2>
              <p className="mt-2 text-sm text-white">Drag & drop images or click to select from your device</p>
            </div>
            <div className="mt-6">
              <UploadFlow compact={true} />
            </div>
          </section>

          <section id="canvas" className="mt-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Create your mind-movie</h2>
              <p className="mt-2 text-sm text-white">Compose your kaleidoscope mind-movie with affirmations and healing frequencies</p>
            </div>
            <div className="mt-6">
              <InductionMindMovieCanvas />
            </div>
          </section>

          <footer className="mt-14 border-t border-white/10 pt-6 text-xs text-white/45">
            MindMint is a quiet little cosmos for your past, present, and future.
          </footer>
        </div>
      </main>
    </CosmicBackground>
  );
}
