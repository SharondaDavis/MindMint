'use client'

import { Sparkles, Wallet } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CosmicBackground } from '@/components/cosmic-background'
import { WalletConnector } from '@/components/wallet-connector'
import { ErrorBoundary } from '@/components/error-boundary'
import { DailySpark } from '@/components/daily-spark'
import { ShareModal } from '@/components/share-modal'
import { AuraCard } from '@/components/aura-card'
import { trackEvent } from '@/lib/analytics'
import { clearShareUnlock, getReferralCode, getReferralVisit, getShareUnlock, setReferralVisit, setShareUnlock } from '@/lib/referral'

const PROMPTS = [
  'What is one tiny win you can complete today?',
  'Where can you choose ease instead of force?',
  'Name one thing you can release right now.',
  'What would support your future self today?',
  'Pick one focus for the next hour.',
]

const SUGGESTIONS_BY_AURA: Record<string, string[]> = {
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

function buildCardNote(auraName: string, keywords: string[], tips: string[]) {
  const [k1, k2] = keywords
  const [tip] = tips
  const keywordLine = k1
    ? `Let ${k1}${k2 ? ` and ${k2}` : ''} move like soft light through your day.`
    : `Let ${auraName.toLowerCase()} energy move like soft light through your day.`
  const tipLine = tip ? `If it helps, follow this thread: ${tip}` : 'Follow the thread of one small, kind action.'
  return [
    `${auraName} aura arrives with a hush, not a demand.`,
    `${keywordLine} ${tipLine}`,
    'You’re not behind—just in bloom at your own pace.',
  ]
}

function getDailyPrompt(date = new Date()) {
  const key = date.toISOString().slice(0, 10)
  const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PROMPTS[hash % PROMPTS.length]
}

export default function RitualPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [hasDailyCheck, setHasDailyCheck] = useState(false)
  const [currentAura, setCurrentAura] = useState('aurora')
  const [affirmation, setAffirmation] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [prompt, setPrompt] = useState(getDailyPrompt())
  const [streak, setStreak] = useState(0)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [sharePayload, setSharePayload] = useState<{
    auraId: string
    auraName: string
    auraEmoji: string
    auraKeywords: string[]
    affirmation: string
    tips: string[]
    noteLines: string[]
    dateLabel: string
    isPractice: boolean
    duration: number
  } | null>(null)
  const [bonusUnlocked, setBonusUnlocked] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    trackEvent('landing_view')
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferralVisit(ref)
      trackEvent('referral_visit', { ref })
    }
  }, [])

  useEffect(() => {
    const saved = window.localStorage.getItem('mindmint:affirmation:v1')
    if (saved) setAffirmation(saved)
    const seed = window.localStorage.getItem('mindmint:affirmation:seed:v1')
    if (seed) setSuggestion(seed)
    setBonusUnlocked(getShareUnlock())
  }, [])

  useEffect(() => {
    trackEvent('ritual_start')
    const ref = getReferralVisit()
    if (ref) {
      trackEvent('referral_convert', { ref })
    }
  }, [])

  const pickSuggestion = (aura = currentAura) => {
    const pool = SUGGESTIONS_BY_AURA[aura] || SUGGESTIONS_BY_AURA.aurora
    const next = pool[Math.floor(Math.random() * pool.length)]
    setSuggestion(next)
    window.localStorage.setItem('mindmint:affirmation:seed:v1', next)
  }

  const canCollect = useMemo(() => hasDailyCheck, [hasDailyCheck])

  const handleWalletConnect = (address: string, _chainId: string) => {
    setWalletAddress(address)
  }

  const handleWalletDisconnect = () => {
    setWalletAddress(null)
  }

  const openShareModal = (payload: typeof sharePayload) => {
    if (!payload) return
    setSharePayload(payload)
    setShareModalOpen(true)
    trackEvent('share_modal_open')
  }

  const unlockBonus = () => {
    setShareUnlock()
    setBonusUnlocked(true)
  }

  return (
    <CosmicBackground>
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8 md:py-16">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300/80 shadow-[0_0_18px_rgba(217,70,239,0.55)]" />
              MindMint • Daily aura
            </div>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <Sparkles className="h-4 w-4" />
              Built for Base • Minting coming soon
            </div>
          </header>

          <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">How it works</div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-white/80">
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">1. Take a deep breath</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">2. Spin the wheel</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">3. Receive your aura</span>
            </div>
          </section>

          <section className="mt-8 grid gap-6">
            <DailySpark
              bonusIntro={bonusUnlocked}
              onBonusConsumed={() => {
                setBonusUnlocked(false)
                clearShareUnlock()
              }}
              onSparkChange={(spark, streakCount) => {
                setHasDailyCheck(!!spark?.dateKey)
                setStreak(streakCount)
                if (spark?.dateKey) {
                  trackEvent('streak_increment', { streak_day: streakCount })
                }
              }}
              onAuraChange={(aura) => {
                setCurrentAura(aura)
                pickSuggestion(aura)
              }}
              onComplete={(payload) => {
                trackEvent('ritual_complete', { session_duration: payload.duration })
                openShareModal({
                  auraId: payload.auraId,
                  auraName: payload.auraName,
                  auraEmoji: payload.auraEmoji,
                  auraKeywords: payload.keywords,
                  affirmation: affirmation || suggestion,
                  tips: payload.tips,
                  noteLines: buildCardNote(payload.auraName, payload.keywords, payload.tips),
                  dateLabel: payload.dateLabel,
                  isPractice: payload.isPractice,
                  duration: payload.duration,
                })
              }}
            />

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white/50">Daily prompt</div>
                  <p className="mt-2 text-lg font-semibold text-white">{prompt}</p>
                  <p className="mt-1 text-xs text-white/60">Streak: {streak} day{streak === 1 ? '' : 's'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrompt(getDailyPrompt(new Date(Date.now() + 86400000)))
                  }}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/15"
                >
                  New prompt
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.25em] text-white/50">Daily affirmation</div>
              <p className="mt-2 text-sm text-white/80">A gentle prompt matched to today’s aura.</p>
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
                    window.localStorage.setItem('mindmint:affirmation:v1', next)
                  }}
                  placeholder="Write your own affirmation..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/60"
                />
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => sharePayload && setShareModalOpen(true)}
                  disabled={!sharePayload}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save + Share
                </button>
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
                      Minting launches in version 2. For now, enjoy the daily aura flow.
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
            A tiny, safe flow: local-first, no public posting, and optional collecting.
          </footer>
        </div>
      </main>

      {sharePayload && (
        <div className="sr-only" aria-hidden="true">
          <AuraCard
            ref={cardRef}
            auraName={sharePayload.auraName}
            auraEmoji={sharePayload.auraEmoji}
            keywords={sharePayload.auraKeywords}
            affirmation={sharePayload.affirmation}
            tips={sharePayload.tips}
            noteLines={sharePayload.noteLines}
            dateLabel={sharePayload.dateLabel}
          />
        </div>
      )}

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        referralCode={getReferralCode()}
        sharePayload={sharePayload}
        onShare={(platform) => {
          trackEvent(`share_click_${platform}`)
          unlockBonus()
        }}
        onCopyLink={() => {
          trackEvent('share_copy_link')
          unlockBonus()
        }}
        onDownload={async () => {
          if (!cardRef.current) return
          const { toPng } = await import('html-to-image')
          const dataUrl = await toPng(cardRef.current)
          const link = document.createElement('a')
          link.href = dataUrl
          link.download = 'mindmint-aura-card.png'
          link.click()
        }}
      />
    </CosmicBackground>
  )
}
