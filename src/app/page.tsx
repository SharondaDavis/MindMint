'use client'

import { Sparkles, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { CosmicBackground } from '@/components/cosmic-background'
import { WalletConnector } from '@/components/wallet-connector'
import { ErrorBoundary } from '@/components/error-boundary'
import { DailySpark } from '@/components/daily-spark'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [hasDailyCheck, setHasDailyCheck] = useState(false)
  const [currentAura, setCurrentAura] = useState('aurora')
  const [affirmation, setAffirmation] = useState('')
  const [suggestion, setSuggestion] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('mindmint:affirmation:v1')
    if (saved) setAffirmation(saved)
    const seed = window.localStorage.getItem('mindmint:affirmation:seed:v1')
    if (seed) setSuggestion(seed)
  }, [])

  const suggestionsByAura: Record<string, string[]> = {
    aurora: [
      'I welcome fresh ideas and playful experiments.',
      'Creativity flows through me in small, steady ways.',
      'I trust my imagination to guide my next step.',
    ],
    ocean: [
      'I move with ease and let the day unfold.',
      'My calm keeps me aligned and grounded.',
      'I choose the smoothest next step.',
    ],
    sunset: [
      'I release what is done and make space for new light.',
      'Today ends with gratitude and grace.',
      'I honor endings as new beginnings.',
    ],
    star: [
      'I share my light with quiet confidence.',
      'My progress deserves to be seen.',
      'I trust myself to shine.',
    ],
    moon: [
      'I listen inward and trust my intuition.',
      'Stillness brings me clarity.',
      'I am safe to slow down and reflect.',
    ],
    crystal: [
      'I choose clarity over clutter.',
      'Focus comes easily when I simplify.',
      'I see what matters most today.',
    ],
  }

  useEffect(() => {
    sdk.actions.ready()
  }, [])

  const pickSuggestion = (aura = currentAura) => {
    const pool = suggestionsByAura[aura] || suggestionsByAura.aurora
    const next = pool[Math.floor(Math.random() * pool.length)]
    setSuggestion(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mindmint:affirmation:seed:v1', next)
    }
  }

  const canCollect = useMemo(() => hasDailyCheck, [hasDailyCheck])

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
              MindMint • A mini app for dreamers
            </div>

            <div className="hidden items-center gap-2 text-xs text-white/60 sm:flex">
              <Sparkles className="h-4 w-4" />
              Play first • Collect optional
            </div>
          </header>

          <section className="mt-8 grid gap-6">
            <DailySpark
              onSparkChange={(spark) => {
                setHasDailyCheck(!!spark?.dateKey)
              }}
              onAuraChange={(aura) => {
                setCurrentAura(aura)
                pickSuggestion(aura)
              }}
            />
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.25em] text-white/50">Daily affirmation</div>
              <p className="mt-2 text-sm text-white/80">
                A gentle prompt matched to today’s aura.
              </p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85">
                {suggestion || 'Tap “Surprise me” to get a suggestion.'}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => pickSuggestion(currentAura)}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                >
                  Surprise me
                </button>
              </div>
              <div className="mt-4">
                <textarea
                  value={affirmation}
                  onChange={(event) => {
                    const next = event.target.value
                    setAffirmation(next)
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem('mindmint:affirmation:v1', next)
                    }
                  }}
                  placeholder="Write your own affirmation..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/60"
                />
              </div>
            </section>
          </section>

          <section className="mt-8">
            {!canCollect ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Collecting is optional</div>
                    <div className="mt-1 text-sm text-white/70">
                      Complete today’s aura check to unlock optional wallet connect + mint.
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
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className="text-sm font-semibold text-white">Wallet connected</div>
                    <div className="mt-1 text-sm text-white/70">
                      Minting launches in version 2. For now, enjoy the daily aura ritual.
                    </div>
                  </div>
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

      </main>
    </CosmicBackground>
  )
}
