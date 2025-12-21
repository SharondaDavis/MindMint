'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Gem, Sparkles, Flame, RefreshCw, ShieldCheck, Music2, Mic, Info, X, Zap, Download } from 'lucide-react'
import { HighFrequencySounds } from '@/components/high-frequency-sounds'
import { AffirmationRecorder } from '@/components/affirmation-recorder'

type WheelResult = {
  aura: typeof SLOT_SYMBOLS[0]
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

type Method = {
  id: string
  title: string
  microQuest: string
  instructions: string[]
  inspiredBy: string
  safety: string[]
  tags: Array<'breath' | 'sound' | 'affirmation'>
}

const STORAGE_KEY = 'mindmint:daily_spark:v1'
const XP_KEY = 'mindmint:xp:v1'

function loadXp(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(XP_KEY)
    const v = raw ? Number(raw) : 0
    return Number.isFinite(v) && v >= 0 ? v : 0
  } catch {
    return 0
  }
}

function saveXp(xp: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(XP_KEY, String(Math.max(0, Math.floor(xp))))
  } catch {
    return
  }
}

function xpForMethod(methodId: string): number {
  switch (methodId) {
    case 'breath-7-7-7':
      return 10
    case 'sats-scene':
      return 15
    case 'elevated-emotion':
      return 15
    case 'affirmation-voice':
      return 20
    case 'dance-reset':
      return 10
    case 'tidy-momentum':
      return 10
    default:
      return 10
  }
}

function lootLabelForMethod(methodId: string): string {
  switch (methodId) {
    case 'sats-scene':
      return 'Scene Token'
    case 'elevated-emotion':
      return 'Gratitude Charge'
    case 'affirmation-voice':
      return 'Voice Rune'
    case 'dance-reset':
      return 'Rhythm Shard'
    case 'tidy-momentum':
      return 'Momentum Chip'
    case 'breath-7-7-7':
      return 'Breath Crystal'
    default:
      return 'Dream Loot'
  }
}

const AFFIRMATIONS = [
  'I am allowed to start small and still change everything.',
  'My next step is enough.',
  'I trust myself to keep showing up.',
  'I can be kind to myself and still be ambitious.',
  'Momentum is my love language.',
  'I’m building a life I actually want to live.',
  'My future is listening to what I do today.',
  'I don’t need perfection — I need a practice.',
]

const METHODS: Method[] = [
  {
    id: 'breath-7-7-7',
    title: '7–7–7 Breath Loop',
    microQuest: 'Do 3 rounds: inhale 7 • hold 7 • exhale 7.',
    instructions: ['Inhale through your nose for 7 seconds.', 'Hold gently for 7 seconds.', 'Exhale slowly for 7 seconds.', 'Repeat for 3 rounds.'],
    inspiredBy: 'Breath-based mindfulness (common across meditation traditions).',
    safety: ['If you feel uncomfortable, stop and breathe normally.', 'Keep the breath gentle (no straining).'],
    tags: ['breath'],
  },
  {
    id: 'sats-scene',
    title: 'SATS Mini-Scene',
    microQuest: 'Close your eyes and replay a 10-second “wish fulfilled” scene 3 times.',
    instructions: [
      'Pick ONE desire (keep it simple).',
      'Imagine a 10-second scene that implies it is already true.',
      'Add a sensory detail (sound, texture, or a smile).',
      'Replay the same short scene 3 times, gently.',
    ],
    inspiredBy: 'Neville Goddard (State Akin To Sleep) style visualization.',
    safety: ['Keep it light and pleasant—no pressure to “force” results.', 'If it feels too intense, switch to a sensory reset (5 things you see).'],
    tags: [],
  },
  {
    id: 'elevated-emotion',
    title: 'Elevated Emotion Switch',
    microQuest: 'For 60 seconds, rehearse gratitude for something you haven’t seen yet.',
    instructions: [
      'Choose a future you want (healthier habits, confidence, peace).',
      'Say (silently): “Thank you for…” and name it as if it’s done.',
      'Let your face soften like it already worked out.',
      'Stay for 60 seconds. Then return to your day.',
    ],
    inspiredBy: 'Joe Dispenza-inspired gratitude + emotional rehearsal (non-clinical).',
    safety: ['If you feel overwhelmed, stop and do 3 normal breaths.', 'Keep it playful—this is practice, not pressure.'],
    tags: [],
  },
  {
    id: 'affirmation-voice',
    title: 'Voice Affirmation (30s)',
    microQuest: 'Record a 30-second affirmation and play it once.',
    instructions: [
      'Write one sentence that feels believable today.',
      'Record it in your own voice (30 seconds).',
      'Play it back once—like you’re encouraging a friend.',
    ],
    inspiredBy: 'Self-affirmation + repetition (common coaching practice).',
    safety: ['Keep it kind—avoid harsh, perfectionist language.', 'If shame shows up, switch to “I’m learning.”'],
    tags: ['affirmation'],
  },
  {
    id: 'dance-reset',
    title: 'Song Reset',
    microQuest: 'Move your body for one chorus (or play a frequency tone).',
    instructions: [
      'Pick a song OR a high-frequency tone.',
      'Move your body until the chorus ends (or 60 seconds).',
      'On the last 5 seconds, smile on purpose.',
    ],
    inspiredBy: 'Somatic reset + mood shift techniques (movement).',
    safety: ['Keep it gentle if your body needs it.', 'Stop if you feel pain or lightheaded.'],
    tags: ['sound'],
  },
  {
    id: 'tidy-momentum',
    title: 'Tiny Tidy Momentum',
    microQuest: 'Tidy one tiny surface for 60 seconds (with a tone if you want).',
    instructions: ['Start a 60-second timer.', 'Clear ONE small surface (desk corner, nightstand).', 'Stop when time is up. That’s the win.'],
    inspiredBy: 'Behavioral momentum (small wins) + environmental reset.',
    safety: ['No perfection—stop at 60 seconds.', 'If you spiral, switch to breathing.'],
    tags: ['sound'],
  },
]

const SLOT_SYMBOLS = [
  { 
    id: 'aurora', 
    name: 'Aurora', 
    emoji: '🌈',
    color: 'from-purple-400 via-pink-400 to-blue-400',
    bgGradient: 'from-purple-600/40 via-pink-600/30 to-blue-600/40',
    tip: 'Today is perfect for creative breakthroughs. Let your imagination flow freely and try something new.'
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    emoji: '🌊',
    color: 'from-blue-400 via-cyan-400 to-teal-400',
    bgGradient: 'from-blue-600/40 via-cyan-600/30 to-teal-600/40',
    tip: 'Go with the flow today. Trust your intuition and allow yourself to adapt to whatever comes your way.'
  },
  { 
    id: 'sunset', 
    name: 'Sunset', 
    emoji: '🌅',
    color: 'from-orange-400 via-red-400 to-pink-400',
    bgGradient: 'from-orange-600/40 via-red-600/30 to-pink-600/40',
    tip: 'Endings lead to new beginnings. Release what no longer serves you and make space for fresh energy.'
  },
  { 
    id: 'star', 
    name: 'Star', 
    emoji: '⭐',
    color: 'from-yellow-400 via-amber-400 to-orange-400',
    bgGradient: 'from-yellow-600/40 via-amber-600/30 to-orange-600/40',
    tip: 'You\'re shining bright today! Share your light with others and celebrate your unique talents.'
  },
  { 
    id: 'moon', 
    name: 'Moon', 
    emoji: '🌙',
    color: 'from-indigo-400 via-purple-400 to-blue-400',
    bgGradient: 'from-indigo-600/40 via-purple-600/30 to-blue-600/40',
    tip: 'Trust your inner wisdom. Take time for reflection and listen to your dreams and intuition.'
  },
  { 
    id: 'crystal', 
    name: 'Crystal', 
    emoji: '💎',
    color: 'from-cyan-400 via-blue-400 to-purple-400',
    bgGradient: 'from-cyan-600/40 via-blue-600/30 to-purple-600/40',
    tip: 'Clarity and focus are your superpowers today. Cut through the noise and see what truly matters.'
  }
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
}: {
  onSparkChange?: (spark: DailySparkState['current'], streak: number) => void
  onAuraChange?: (aura: string) => void
}) {
  const [state, setState] = useState<DailySparkState>(() => loadState())
  const [xp, setXp] = useState(() => loadXp())
  const [showInfo, setShowInfo] = useState(false)
  const [showSound, setShowSound] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)
  const [selectedSoundId, setSelectedSoundId] = useState<string | undefined>(undefined)

  const [showQuest, setShowQuest] = useState(false)
  const [lootDrop, setLootDrop] = useState<{ xpGained: number; loot: string } | null>(null)
  const [satsReplays, setSatsReplays] = useState(0)
  const [chargeIsRunning, setChargeIsRunning] = useState(false)
  const [chargeLeft, setChargeLeft] = useState(60)
  const chargeIntervalRef = useRef<number | null>(null)

  const [gamePhase, setGamePhase] = useState<'breathing' | 'ready' | 'spinning' | 'result'>('breathing')
  const [breathCount, setBreathCount] = useState(0)
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale')
  const [breathTimeLeft, setBreathTimeLeft] = useState(4)
  
  const [isSpinning, setIsSpinning] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)
  const spinIntervalRef = useRef<number | null>(null)
  const breathIntervalRef = useRef<number | null>(null)

  const todayKey = useMemo(() => getDateKey(new Date()), [])

  useEffect(() => {
    onSparkChange?.(state.current, state.streak)
    if (state.current?.wheelResult?.aura) {
      onAuraChange?.(state.current.wheelResult.aura.id)
    }
  }, [onSparkChange, state.current, state.streak, onAuraChange])

  const hasToday = state.current?.dateKey === todayKey

  const questKind = useMemo(() => {
    // Simplified for slot machine - always show breathing phase first
    return {
      isBreathing: true,
      wantsSound: false,
      wantsAffirmation: false,
    }
  }, [])

  
  useEffect(() => {
    return () => {
      if (breathIntervalRef.current) {
        window.clearInterval(breathIntervalRef.current)
        breathIntervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (chargeIntervalRef.current) {
        window.clearInterval(chargeIntervalRef.current)
        chargeIntervalRef.current = null
      }
      if (spinIntervalRef.current) {
        window.clearInterval(spinIntervalRef.current)
        spinIntervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const onGround = () => {
      setShowInfo(false)
      setShowSound(false)
      setShowRecorder(false)
      setSelectedSoundId(undefined)
      setShowQuest(false)
      setLootDrop(null)
      setSatsReplays(0)
      setChargeIsRunning(false)
      setChargeLeft(60)
      if (chargeIntervalRef.current) {
        window.clearInterval(chargeIntervalRef.current)
        chargeIntervalRef.current = null
      }
      stopBreathing()
    }

    window.addEventListener('mindmint:ground', onGround)
    return () => window.removeEventListener('mindmint:ground', onGround)
  }, [])

  const generate = () => {
    const now = new Date()
    const dateKey = getDateKey(now)
    const seed = hashString(dateKey + ':mindmint')

    // Generate wheel result - pick one aura
    const aura = pick(SLOT_SYMBOLS, seed + 1)
    const rotation = (seed % 360) + (720 * 3) // At least 3 full rotations
    
    const wheelResult: WheelResult = {
      aura,
      rotation
    }

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
  }

  const resetQuestState = () => {
    setSatsReplays(0)
    setChargeIsRunning(false)
    setChargeLeft(60)
    if (chargeIntervalRef.current) {
      window.clearInterval(chargeIntervalRef.current)
      chargeIntervalRef.current = null
    }
  }

  const openQuest = () => {
    if (!state.current) return
    resetQuestState()
    setLootDrop(null)
    setShowQuest(true)
  }

  const completeQuest = () => {
    // Simplified for slot machine - award base XP
    const gained = 10
    const nextXp = xp + gained
    setXp(nextXp)
    saveXp(nextXp)
    setLootDrop({ xpGained: gained, loot: 'Daily Aura' })
  }

  const startCharge = () => {
    if (chargeIntervalRef.current) window.clearInterval(chargeIntervalRef.current)
    setChargeIsRunning(true)

    chargeIntervalRef.current = window.setInterval(() => {
      setChargeLeft((prev) => {
        if (prev <= 1) {
          if (chargeIntervalRef.current) {
            window.clearInterval(chargeIntervalRef.current)
            chargeIntervalRef.current = null
          }
          setChargeIsRunning(false)
          setChargeLeft(0)
          completeQuest()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopCharge = () => {
    if (chargeIntervalRef.current) {
      window.clearInterval(chargeIntervalRef.current)
      chargeIntervalRef.current = null
    }
    setChargeIsRunning(false)
  }

  const startBreathing = () => {
    setIsBreathing(true)
    setBreathPhase('inhale')
    setBreathTimeLeft(4)
    setBreathCount(0)
    
    breathIntervalRef.current = window.setInterval(() => {
      setBreathTimeLeft((prev) => {
        if (prev > 1) return prev - 1
        
        // Switch breath phase
        setBreathPhase((current) => {
          if (current === 'inhale') {
            setBreathCount((count) => count + 1)
            return 'exhale'
          } else {
            return 'inhale'
          }
        })
        
        return 4
      })
    }, 1000)
  }

  const stopBreathing = () => {
    if (breathIntervalRef.current) {
      window.clearInterval(breathIntervalRef.current)
      breathIntervalRef.current = null
    }
    setIsBreathing(false)
    if (breathCount >= 3) {
      setGamePhase('ready')
    }
  }

  const spinWheel = () => {
    const now = new Date()
    const dateKey = getDateKey(now)
    const seed = hashString(dateKey + ':mindmint:' + Date.now().toString())

    // Generate wheel result - pick one aura
    const aura = pick(SLOT_SYMBOLS, seed + 1)
    const finalRotation = (seed % 360) + (720 * 3) // At least 3 full rotations
    
    const wheelResult: WheelResult = {
      aura,
      rotation: finalRotation
    }

    // Start spinning animation
    setGamePhase('spinning')
    setIsSpinning(true)
    
    let currentRotation = 0
    const spinDuration = 4000 // 4 seconds
    const startTime = Date.now()
    
    spinIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / spinDuration, 1)
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      currentRotation = finalRotation * easeOut
      
      setWheelRotation(currentRotation)
      
      if (progress >= 1) {
        setIsSpinning(false)
        setGamePhase('result')
        
        if (spinIntervalRef.current) {
          window.clearInterval(spinIntervalRef.current)
          spinIntervalRef.current = null
        }
        
        // Save result
        setState((prev) => {
          const next: DailySparkState = {
            current: { dateKey, wheelResult },
            streak: prev.streak,
            lastDateKey: dateKey,
          }
          saveState(next)
          return next
        })
        
        // Award base XP
        const xpGained = 10
        setXp((prev) => {
          const newXp = prev + xpGained
          saveXp(newXp)
          return newXp
        })
        
        // Notify parent of aura change
        onAuraChange?.(aura.id)
      }
    }, 16) // 60fps
  }

  const startNewBreathing = () => {
    setIsBreathing(true)
    setBreathPhase('inhale')
    setBreathTimeLeft(4)
    setBreathCount(0)
    
    breathIntervalRef.current = window.setInterval(() => {
      setBreathTimeLeft((prev) => {
        if (prev > 1) return prev - 1
        
        // Switch breath phase
        setBreathPhase((current) => {
          if (current === 'inhale') {
            setBreathCount((count) => count + 1)
            return 'exhale'
          } else {
            return 'inhale'
          }
        })
        
        return 4
      })
    }, 1000)
  }

return (
  <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/30 via-purple-900/20 to-slate-900/30 p-6 backdrop-blur">
    {/* Subtle background */}
    <div className="absolute -inset-8 bg-gradient-to-br from-slate-600/20 via-purple-600/10 to-slate-600/20 blur-2xl" />
    
    <div className="relative">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Daily Aura Wheel
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          Your Daily Aura
        </h1>
        <p className="text-sm text-white/70">
          Take 3 breaths, then spin the wheel for your daily guidance
        </p>
      </div>

      {/* Daily Streak */}
      <div className="mt-4 flex justify-center">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-white">
          <div className="text-xs text-white/60">STREAK</div>
          <div className="text-lg font-bold">{state.streak} days</div>
        </div>
      </div>

      {/* Game Phases */}
      {gamePhase === 'breathing' && (
        <div className="mt-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🧘‍♀️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Center Yourself</h3>
            <p className="text-sm text-white/70 mb-4">
              Take 3 deep breaths to prepare for your daily aura
            </p>
          </div>
          
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-white/20 bg-black/30 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{breathCount}/3</div>
                <div className="text-xs text-white/60">Breaths</div>
              </div>
            </div>
            
            {isBreathing && (
              <div className="mb-4">
                <div className="text-lg font-semibold text-white capitalize mb-2">
                  {breathPhase}
                </div>
                <div className="text-sm text-white/70">
                  {breathTimeLeft} seconds
                </div>
                <div className="w-64 h-2 mx-auto bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-1000"
                    style={{ width: `${((4 - breathTimeLeft) / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={isBreathing ? stopBreathing : startNewBreathing}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            {isBreathing ? 'Finish Breathing' : 'Start Breathing'}
          </button>
        </div>
      )}

      {gamePhase === 'ready' && (
        <div className="mt-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Spin</h3>
            <p className="text-sm text-white/70">
              Spin the wheel to discover your daily aura
            </p>
          </div>
          
          <button
            onClick={spinWheel}
            className="px-12 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xl rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
          >
            Spin the Wheel
          </button>
        </div>
      )}

      {gamePhase === 'spinning' && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white animate-pulse">Spinning...</h3>
          </div>
          
          {/* Spinning Wheel */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-red-500"></div>
              </div>
              <div 
                className="w-64 h-64 rounded-full border-4 border-white/20 shadow-2xl transition-transform duration-100"
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                {/* Wheel segments */}
                {SLOT_SYMBOLS.map((symbol, index) => {
                  const angle = (360 / SLOT_SYMBOLS.length) * index
                  const nextAngle = (360 / SLOT_SYMBOLS.length) * (index + 1)
                  const midAngle = (angle + nextAngle) / 2
                  
                  return (
                    <div
                      key={symbol.id}
                      className={`absolute inset-0 ${symbol.bgGradient}`}
                      style={{
                        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((nextAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((nextAngle - 90) * Math.PI / 180)}%)`
                      }}
                    >
                      <div 
                        className="absolute text-2xl"
                        style={{
                          left: `${50 + 30 * Math.cos((midAngle - 90) * Math.PI / 180)}%`,
                          top: `${50 + 30 * Math.sin((midAngle - 90) * Math.PI / 180)}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {symbol.emoji}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {gamePhase === 'result' && state.current && (
        <div className="mt-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">{state.current.wheelResult.aura.emoji}</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {state.current.wheelResult.aura.name}
            </h3>
            
            {/* Aura Display */}
            <div className="mb-6">
              <div className={`w-32 h-32 mx-auto rounded-2xl border-2 border-white/30 bg-gradient-to-br ${state.current.wheelResult.aura.bgGradient} flex items-center justify-center text-6xl shadow-lg`}>
                {state.current.wheelResult.aura.emoji}
              </div>
            </div>

            {/* Aura Tip */}
            <div className="text-left bg-black/20 rounded-2xl p-4 mb-6 max-w-md mx-auto">
              <h4 className="text-sm font-semibold text-white mb-2">Today's Guidance:</h4>
              <div className="text-sm text-white/80">
                {state.current.wheelResult.aura.tip}
              </div>
            </div>

            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30">
              <div className="text-sm text-white/80">
                Daily streak: {state.streak} {state.streak === 1 ? 'day' : 'days'}
              </div>
            </div>

            <button
              onClick={() => setGamePhase('breathing')}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Spin Again Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Info Modal */}
    {showInfo && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-white">Daily Aura Wheel</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 backdrop-blur transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm text-white/70 space-y-2">
            <p>🎯 A simple daily mindfulness practice</p>
            <p>🧘 Take 3 deep breaths to center yourself</p>
            <p>🌈 Spin the wheel for your daily aura</p>
            <p>🔥 Build your daily streak for consistency</p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-white/50">No account needed • Local-only • Build daily habits</p>
            </div>
          </div>
        </div>
      </div>
    )}
  </section>
)
}
