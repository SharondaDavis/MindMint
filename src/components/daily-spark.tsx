'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Share2, Sparkles, Volume2 } from 'lucide-react'

type Aura = {
  id: string
  name: string
  emoji: string
  wheelColor: string
  glow: string
  tip: string
  support: string[]
  keywords: string[]
}

type WheelResult = {
  aura: Aura
  rotation: number
}

type DailySparkState = {
  current: {
    dateKey: string
    wheelResult: WheelResult
  } | null
  streak: number
  lastDateKey: string | null
}

const STORAGE_KEY = 'mindmint:daily_spark:v1'
const MODES = ['morning', 'afternoon', 'night'] as const
type RitualMode = typeof MODES[number]

const MODE_COPY: Record<RitualMode, { title: string; prompt: string; cta: string }> = {
  morning: {
    title: 'Morning aura',
    prompt: 'A quick reset to align your day.',
    cta: 'Take a deep breath and spin the wheel.',
  },
  afternoon: {
    title: 'Afternoon check‑in',
    prompt: 'Refocus with a short mid‑day reset.',
    cta: 'Take a deep breath and spin the wheel.',
  },
  night: {
    title: 'Night intentions',
    prompt: 'Close the day and set tomorrow’s tone.',
    cta: 'Take a deep breath and spin the wheel.',
  },
}

function getModeForHour(date = new Date()): RitualMode {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'night'
}


const AURAS: Aura[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🌈',
    wheelColor: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.6)',
    tip: 'Creative breakthroughs are close. Make room for experiments.',
    support: ['Try one tiny new idea today.', 'Swap routines for 10 minutes.', 'Capture a spark in notes.'],
    keywords: ['creative', 'bright', 'playful'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    wheelColor: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.6)',
    tip: 'Flow over force. Let the day move you forward.',
    support: ['Slow your pace by 10%.', 'Hydrate before decisions.', 'Choose the smoothest next step.'],
    keywords: ['flow', 'calm', 'clear'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    wheelColor: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.6)',
    tip: 'Release what is done. Make space for what is next.',
    support: ['Close one open loop.', 'Give something a gentle ending.', 'Notice one good thing from today.'],
    keywords: ['release', 'warm', 'renew'],
  },
  {
    id: 'star',
    name: 'Star',
    emoji: '⭐',
    wheelColor: '#facc15',
    glow: 'rgba(250, 204, 21, 0.65)',
    tip: 'Your light helps others. Share a small win.',
    support: ['Send one encouraging message.', 'Take a proud snapshot of progress.', 'Say yes to visibility.'],
    keywords: ['bold', 'confident', 'bright'],
  },
  {
    id: 'moon',
    name: 'Moon',
    emoji: '🌙',
    wheelColor: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.6)',
    tip: 'Quiet focus beats noise. Listen inward.',
    support: ['Turn down one distraction.', 'Journal for 3 minutes.', 'Let intuition choose the next action.'],
    keywords: ['quiet', 'wise', 'steady'],
  },
  {
    id: 'crystal',
    name: 'Crystal',
    emoji: '💎',
    wheelColor: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.6)',
    tip: 'Clarity arrives through simplicity. Trim the clutter.',
    support: ['Delete one thing you do not need.', 'Name the single priority.', 'Clean a small surface.'],
    keywords: ['clear', 'focused', 'light'],
  },
]

function getDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

function loadState(): DailySparkState {
  if (typeof window === 'undefined') return { current: null, streak: 0, lastDateKey: null }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { current: null, streak: 0, lastDateKey: null }
    const parsed = JSON.parse(raw) as DailySparkState

    return {
      current: parsed?.current ?? null,
      streak: typeof parsed?.streak === 'number' ? parsed.streak : 0,
      lastDateKey: typeof parsed?.lastDateKey === 'string' ? parsed.lastDateKey : null,
    }
  } catch {
    return { current: null, streak: 0, lastDateKey: null }
  }
}

function saveState(state: DailySparkState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}

function isYesterday(prevDateKey: string, today: Date): boolean {
  const prev = new Date(prevDateKey + 'T00:00:00.000Z')
  const yesterday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1))
  return prev.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10)
}

export function DailySpark({
  onSparkChange,
  onAuraChange,
  onComplete,
  bonusIntro = false,
  onBonusConsumed,
}: {
  onSparkChange?: (spark: DailySparkState['current'], streak: number) => void
  onAuraChange?: (aura: string) => void
  onComplete?: (payload: {
    auraName: string
    auraEmoji: string
    keywords: string[]
    tips: string[]
    dateLabel: string
    isPractice: boolean
    duration: number
  }) => void
  bonusIntro?: boolean
  onBonusConsumed?: () => void
}) {
  const [state, setState] = useState<DailySparkState>(() => loadState())
  const [mounted, setMounted] = useState(false)
  const [gamePhase, setGamePhase] = useState<'ready' | 'spinning' | 'result'>('ready')
  const [practiceResult, setPracticeResult] = useState<WheelResult | null>(null)
  const [ritualMode, setRitualMode] = useState<RitualMode>('morning')
  const [isSoundOn, setIsSoundOn] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [showBonusIntro, setShowBonusIntro] = useState(false)
  const bonusConsumedRef = useRef(false)
  const sessionStartRef = useRef<number | null>(null)
  const [wheelRotation, setWheelRotation] = useState(0)
  const spinIntervalRef = useRef<number | null>(null)

  const todayKey = useMemo(() => getDateKey(new Date()), [])
  const hasToday = state.current?.dateKey === todayKey
  const activeAura = state.current?.wheelResult.aura

  useEffect(() => {
    setMounted(true)
    const mode = getModeForHour()
    setRitualMode(mode)
    onSparkChange?.(state.current, state.streak)
    if (state.current?.wheelResult?.aura) {
      onAuraChange?.(state.current.wheelResult.aura.id)
      setWheelRotation(state.current.wheelResult.rotation)
    }
  }, [onSparkChange, state.current, state.streak, onAuraChange])

  useEffect(() => {
    if (!mounted) return
    startSound()
    return () => stopSound()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    if (hasToday) {
      setGamePhase('result')
    } else {
      setGamePhase('ready')
    }
  }, [hasToday, mounted])

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) {
        window.clearInterval(spinIntervalRef.current)
        spinIntervalRef.current = null
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const onGround = () => {
      stopSound()
      if (!hasToday) {
        setGamePhase('ready')
      }
    }

    window.addEventListener('mindmint:ground', onGround)
    return () => window.removeEventListener('mindmint:ground', onGround)
  }, [hasToday])

  const stopSound = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsSoundOn(false)
  }

  const startSound = async () => {
    if (isSoundOn) return
    if (!audioRef.current) {
      audioRef.current = new Audio('/ambient.m4a')
      audioRef.current.loop = true
      audioRef.current.volume = 0.25
    }
    try {
      await audioRef.current.play()
      setIsSoundOn(true)
    } catch {
      return
    }
  }

  const toggleSound = () => {
    if (isSoundOn) {
      stopSound()
    } else {
      startSound()
    }
  }

  const playChime = () => {
    if (!audioRef.current) return
    const currentVolume = audioRef.current.volume
    audioRef.current.volume = Math.min(1, currentVolume + 0.15)
    window.setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = currentVolume
      }
    }, 400)
  }

  const performSpin = (practiceSpin: boolean) => {
    const now = new Date()
    const dateKey = getDateKey(now)
    const seed = hashString(dateKey + ':mindmint:' + Date.now().toString())
    const aura = pick(AURAS, seed + 1)
    const finalRotation = (seed % 360) + 1080

    const wheelResult: WheelResult = {
      aura,
      rotation: finalRotation,
    }

    setGamePhase('spinning')

    let currentRotation = 0
    const spinDuration = 4000
    const startTime = Date.now()

    spinIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / spinDuration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      currentRotation = finalRotation * easeOut

      setWheelRotation(currentRotation)

      if (progress >= 1) {
        if (spinIntervalRef.current) {
          window.clearInterval(spinIntervalRef.current)
          spinIntervalRef.current = null
        }

        if (practiceSpin) {
          setPracticeResult(wheelResult)
        } else {
          setState((prev) => {
            const nextStreak =
              prev.lastDateKey && isYesterday(prev.lastDateKey, now) ? Math.max(1, prev.streak + 1) : 1

            const next: DailySparkState = {
              current: { dateKey, wheelResult },
              streak: nextStreak,
              lastDateKey: dateKey,
            }

            saveState(next)
            return next
          })

          onAuraChange?.(aura.id)
        }

        const duration = sessionStartRef.current ? Math.floor((Date.now() - sessionStartRef.current) / 1000) : 0
        onComplete?.({
          auraName: aura.name,
          auraEmoji: aura.emoji,
          keywords: aura.keywords,
          tips: aura.support,
          dateLabel: dateKey,
          isPractice: practiceSpin,
          duration,
        })

        playChime()
        setGamePhase('result')
      }
    }, 16)
  }

  const spinWheel = () => {
    if (gamePhase === 'spinning') return
    if (gamePhase !== 'ready') {
      setGamePhase('ready')
    }
    const practiceSpin = hasToday
    if (practiceSpin) {
      setPracticeResult(null)
    }
    sessionStartRef.current = Date.now()

    if (bonusIntro && !bonusConsumedRef.current) {
      setShowBonusIntro(true)
      bonusConsumedRef.current = true
      onBonusConsumed?.()
      window.setTimeout(() => {
        setShowBonusIntro(false)
        performSpin(practiceSpin)
      }, 3000)
      return
    }

    performSpin(practiceSpin)
  }

  const wheelGradient = useMemo(() => {
    const slice = 360 / AURAS.length
    return `conic-gradient(${AURAS.map((aura, index) => {
      const start = index * slice
      const end = (index + 1) * slice
      return `${aura.wheelColor} ${start}deg ${end}deg`
    }).join(', ')})`
  }, [])

  const displayAura = practiceResult?.aura ?? activeAura
  const auraTips = displayAura?.support ?? []
  const modeCopy = MODE_COPY[ritualMode]
  const guidanceText = hasToday
    ? 'Daily aura is locked in. Spin again anytime for a practice spin.'
    : 'Take a deep breath, then spin the wheel.'

  if (!mounted) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#16062f] via-[#1d0f57] to-[#0b1028] p-6 backdrop-blur">
        <div className="absolute -inset-8 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(255,255,255,0.03) 70%, transparent 100%)' }}
        />
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/80">
            <Sparkles className="h-3.5 w-3.5" />
            Futuristic Daily Aura Check
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-white">Daily Aura Wheel</h2>
          <p className="mt-2 text-sm text-white/70">Loading your aura sync...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#16062f] via-[#1d0f57] to-[#0b1028] p-6 backdrop-blur">
      <div className="absolute -inset-8 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_60%)]" />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(255,255,255,0.03) 70%, transparent 100%)' }} />

      <div className="relative">
        <header className="text-center">
          <h2 className="text-3xl font-semibold text-white">Daily Aura Wheel</h2>
          <p className="mt-2 text-sm text-white/70">
            {guidanceText}
          </p>
        </header>

        <div className="mt-5 text-center text-xs uppercase tracking-[0.3em] text-white/50">
          {ritualMode} flow
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          <div className="text-xs uppercase tracking-[0.25em] text-white/50">Flow mode</div>
          <div className="mt-2 text-base font-semibold text-white">{modeCopy.title}</div>
          <p className="mt-1 text-sm text-white/70">{modeCopy.prompt}</p>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/15 bg-[#0b1d3a] px-6 py-6 text-left shadow-[0_20px_60px_rgba(5,12,30,0.6)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-white/50">Quick reset</div>
              <div className="mt-2 text-lg font-semibold text-white">Take a deep breath</div>
              <p className="mt-1 text-sm text-white/70">
                Spin the wheel when you’re ready for your aura.
              </p>
            </div>
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
              <Share2 className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Volume2 className="h-4 w-4" />
                Ambient tone
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSoundOn ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isSoundOn ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="relative">
            {showBonusIntro && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-black/70 text-center">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-5 text-sm text-white/80">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/60">Bonus</div>
                  <div className="mt-2 text-lg font-semibold text-white">Kaleidoscope intro</div>
                  <div className="mt-1 text-xs text-white/60">Unlocking your spin...</div>
                </div>
              </div>
            )}
            <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2">
              <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-b-[22px] border-l-transparent border-r-transparent border-b-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.9)]" />
            </div>

            <div
              className="relative h-72 w-72 rounded-full border border-white/20 shadow-[0_0_90px_rgba(99,102,241,0.7)]"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ backgroundImage: wheelGradient }}
              />
              <div className="absolute inset-[12%] rounded-full bg-slate-950/90 border border-white/10" />
              <div className="absolute inset-[38%] rounded-full bg-slate-900/90 border border-white/10" />
              <div className="absolute inset-[46%] rounded-full bg-black/50 border border-white/10" />

              {AURAS.map((aura, index) => {
                const slice = 360 / AURAS.length
                const angle = index * slice + slice / 2 - 90
                return (
                  <div
                    key={aura.id}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -85px) rotate(${-angle}deg)`
                    }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 text-3xl shadow"
                      style={{ boxShadow: `0 0 24px ${aura.glow}` }}
                    >
                      {aura.emoji}
                    </div>
                  </div>
                )
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/60 text-3xl shadow-[0_0_26px_rgba(255,255,255,0.15)]">
                  {displayAura ? displayAura.emoji : '✨'}
                </div>
              </div>
            </div>

            <div className="absolute -right-20 top-1/2 -translate-y-1/2">
              <button
                onClick={spinWheel}
                disabled={gamePhase === 'spinning'}
                className="group flex flex-col items-center gap-2 disabled:cursor-not-allowed"
                aria-label="Spin the wheel"
              >
                <div className="relative flex flex-col items-center">
                  <div className="absolute -top-6 h-6 w-6 rounded-full border border-cyan-200/60 bg-cyan-100/30 blur-[6px]" />
                  <div className="h-32 w-3 rounded-full bg-gradient-to-b from-white/80 via-white/50 to-white/10 shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-300/40 blur-xl" />
                  <div className="h-12 w-12 rounded-full border border-cyan-200/70 bg-gradient-to-br from-fuchsia-400 via-cyan-400 to-indigo-400 shadow-[0_0_32px_rgba(56,189,248,0.9)] transition group-hover:scale-110 group-active:translate-y-1" />
                </div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-white/70">Spin wheel</div>
              </button>
            </div>
          </div>

          {gamePhase === 'spinning' && (
            <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
              Spinning...
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">Aura Output</div>
              <div className="mt-2 text-xl font-semibold text-white">
                {displayAura ? `${displayAura.name} Aura` : 'Awaiting your spin'}
              </div>
            </div>
            {displayAura && (
              <div className="flex items-center gap-3">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 text-3xl"
                  style={{ boxShadow: `0 0 28px ${displayAura.glow}` }}
                >
                  {displayAura.emoji}
                </div>
                <div>
                  <div className="text-base font-semibold text-white">{displayAura.name}</div>
                  {practiceResult && (
                    <div className="text-xs text-white/60">Practice spin</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="mt-3 text-sm text-white/70">
            {displayAura ? displayAura.tip : 'Spin the wheel to see your guidance.'}
          </p>

          {displayAura && (
            <div className="mt-4 grid gap-2 text-sm text-white/75">
              {auraTips.map((tip) => (
                <div key={tip} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  {tip}
                </div>
              ))}
            </div>
          )}

          {hasToday && (
            <div className="mt-4 text-xs text-white/50">
              Come back tomorrow for your next daily check.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
