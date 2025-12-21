'use client'

import { LifeBuoy, Sparkles, Wallet, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { CosmicBackground } from '@/components/cosmic-background'
import { WalletConnector } from '@/components/wallet-connector'
import { DreamMinter } from '@/components/dream-minter'
import { ErrorBoundary } from '@/components/error-boundary'
import { DailySpark } from '@/components/daily-spark'
import { DreamBingo } from '@/components/dream-bingo'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [bingoHasRow, setBingoHasRow] = useState(false)
  const [bingoIsFull, setBingoIsFull] = useState(false)
  const [showGrounding, setShowGrounding] = useState(false)
  const [currentAura, setCurrentAura] = useState<string>('aurora')

  useEffect(() => {
    sdk.actions.ready()
  }, [])

  const openGrounding = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mindmint:ground'))
    }
    setShowGrounding(true)
  }

  const canCollect = useMemo(() => bingoHasRow || bingoIsFull, [bingoHasRow, bingoIsFull])

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
        <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8 md:py-16">
          <header className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300/80 shadow-[0_0_18px_rgba(217,70,239,0.55)]" />
              MindMint • The funnest mini app for dreamers
            </div>

            <div className="hidden items-center gap-2 text-xs text-white/60 sm:flex">
              <Sparkles className="h-4 w-4" />
              Play first • Collect optional
            </div>
          </header>

          <section className="mt-8 grid gap-6">
            <DailySpark 
              onAuraChange={(aura) => setCurrentAura(aura)}
            />
            <DreamBingo
              auraType={currentAura}
              onProgress={({ hasRow, isFull }) => {
                setBingoHasRow(hasRow)
                setBingoIsFull(isFull)
              }}
            />
          </section>

          <section className="mt-8">
            {!canCollect ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Collecting is optional</div>
                    <div className="mt-1 text-sm text-white/70">
                      Complete a bingo row to unlock optional wallet connect + mint.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white/80">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <ErrorBoundary>
                  <WalletConnector onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
                </ErrorBoundary>
                {walletAddress ? (
                  <ErrorBoundary>
                    <DreamMinter
                      walletAddress={walletAddress}
                      dreamBoard={{
                        name: bingoIsFull ? 'My Dream Week' : 'My Dream Row',
                        description: bingoIsFull
                          ? 'A week of tiny actions that added up to something real.'
                          : 'A small row of wins — proof I showed up.',
                        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
                        categories: bingoIsFull ? ['dreams', 'vision', 'manifestation'] : ['vision', 'manifestation'],
                      }}
                    />
                  </ErrorBoundary>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className="text-sm font-semibold text-white">Ready when you are</div>
                    <div className="mt-1 text-sm text-white/70">
                      Connect a wallet to collect your progress on Base. You can also just keep playing.
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-white/45">
            A tiny, safe ritual: local-first, no public posting, and optional collecting.
          </footer>
        </div>

        <button
          onClick={openGrounding}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
          aria-label="Dream Anchor"
        >
          <LifeBuoy className="h-4 w-4" />
          Dream Anchor
        </button>

        {showGrounding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/60">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
                <div>
                  <div className="text-sm font-semibold text-white">Dream Anchor (5–4–3)</div>
                  <div className="mt-1 text-xs text-white/60">A quick sensory reset to get back into the game.</div>
                </div>
                <button
                  onClick={() => setShowGrounding(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/60"
                  aria-label="Close grounding"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 p-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs text-white/60">Step 1</div>
                  <div className="mt-1 text-sm font-semibold text-white">Name 5 things you can see.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs text-white/60">Step 2</div>
                  <div className="mt-1 text-sm font-semibold text-white">Name 4 things you can feel.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs text-white/60">Step 3</div>
                  <div className="mt-1 text-sm font-semibold text-white">Name 3 things you can hear.</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/60">
                  Bonus: after you finish, tap “Reroll” and try a different Dream Method.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/10 p-4">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('mindmint:ground'))
                    }
                  }}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
                >
                  Stop & reset
                </button>
                <button
                  onClick={() => setShowGrounding(false)}
                  className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/60"
                >
                  I’m good
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </CosmicBackground>
  )
}
