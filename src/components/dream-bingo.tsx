'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Trophy, CalendarDays, RotateCcw } from 'lucide-react'

type BingoCell = {
  id: string
  label: string
  auraType?: string
}

type BingoState = {
  weekKey: string
  completed: Record<string, true>
}

const STORAGE_KEY = 'mindmint:dream_bingo:v1'

// Aura-specific bingo suggestions
const getAuraCells = (auraType: string): BingoCell[] => {
  const auraSuggestions: Record<string, BingoCell[]> = {
    'aurora': [
      { id: 'breathe', label: '6 deep breaths' },
      { id: 'water', label: 'Drink water' },
      { id: 'walk', label: 'Step outside' },
      { id: 'text', label: 'Send a kind text' },
      { id: 'focus', label: '2 minutes on a task' },
      { id: 'stretch', label: '30s stretch' },
      { id: 'tidy', label: 'Tidy one tiny space' },
      { id: 'gratitude', label: 'Name 1 gratitude' },
      { id: 'music', label: 'One song dance' },
    ],
    'ocean': [
      { id: 'wash', label: 'Wash hands mindfully' },
      { id: 'water', label: 'Drink 8oz water' },
      { id: 'beach', label: 'Visit water if possible' },
      { id: 'flow', label: 'Go with the flow' },
      { id: 'deep', label: 'Take 3 deep breaths' },
      { id: 'cleanse', label: 'Cleanse your space' },
      { id: 'reflect', label: 'Reflect on emotions' },
      { id: 'gratitude', label: 'Thank the water' },
      { id: 'music', label: 'Listen to ocean sounds' },
    ],
    'sunset': [
      { id: 'breathe', label: 'Watch sunset mindfully' },
      { id: 'water', label: 'Drink warm tea' },
      { id: 'walk', label: 'Evening stroll' },
      { id: 'text', label: 'Share appreciation' },
      { id: 'focus', label: '2 min reflection' },
      { id: 'stretch', label: 'Gentle sunset stretch' },
      { id: 'tidy', label: 'Clear evening space' },
      { id: 'gratitude', label: 'List 3 gratitudes' },
      { id: 'music', label: 'Play calming music' },
    ],
    'star': [
      { id: 'breathe', label: 'Stargazing breaths' },
      { id: 'water', label: 'Drink water' },
      { id: 'walk', label: 'Night sky walk' },
      { id: 'text', label: 'Share inspiration' },
      { id: 'focus', label: '2 min stargazing' },
      { id: 'stretch', label: 'Reach for the stars' },
      { id: 'tidy', label: 'Clear your mind' },
      { id: 'gratitude', label: 'Count your blessings' },
      { id: 'music', label: 'Play uplifting music' },
    ],
    'moon': [
      { id: 'breathe', label: 'Moon phase breathing' },
      { id: 'water', label: 'Drink moon water' },
      { id: 'walk', label: 'Moonlight walk' },
      { id: 'text', label: 'Send loving thoughts' },
      { id: 'focus', label: '2 min moon meditation' },
      { id: 'stretch', label: 'Lunar stretch' },
      { id: 'tidy', label: 'Organize by moonlight' },
      { id: 'gratitude', label: 'Lunar gratitude' },
      { id: 'music', label: 'Play moon music' },
    ],
    'crystal': [
      { id: 'breathe', label: 'Crystal breathing' },
      { id: 'water', label: 'Drink charged water' },
      { id: 'walk', label: 'Nature connection' },
      { id: 'text', label: 'Share clarity' },
      { id: 'focus', label: '2 min crystal focus' },
      { id: 'stretch', label: 'Crystal stretch' },
      { id: 'tidy', label: 'Organize with intention' },
      { id: 'gratitude', label: 'Crystal gratitude' },
      { id: 'music', label: 'Play crystal sounds' },
    ],
  }

  return auraSuggestions[auraType] || auraSuggestions['aurora']
}

function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay()
  const diffToMonday = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diffToMonday)
  return d.toISOString().slice(0, 10)
}

function loadState(weekKey: string): BingoState {
  if (typeof window === 'undefined') return { weekKey, completed: {} }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { weekKey, completed: {} }
    const parsed = JSON.parse(raw) as BingoState

    if (parsed?.weekKey !== weekKey) return { weekKey, completed: {} }

    return {
      weekKey,
      completed: typeof parsed?.completed === 'object' && parsed.completed ? parsed.completed : {},
    }
  } catch {
    return { weekKey, completed: {} }
  }
}

function saveState(state: BingoState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}

function computeLines() {
  return [
    ['0', '1', '2'],
    ['3', '4', '5'],
    ['6', '7', '8'],
    ['0', '3', '6'],
    ['1', '4', '7'],
    ['2', '5', '8'],
    ['0', '4', '8'],
    ['2', '4', '6'],
  ]
}

export function DreamBingo({
  onProgress,
  auraType = 'aurora',
}: {
  onProgress?: (progress: { completedCount: number; hasRow: boolean; isFull: boolean; weekKey: string }) => void
  auraType?: string
}) {
  const weekKey = useMemo(() => getWeekKey(new Date()), [])
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<BingoState>({ weekKey, completed: {} })
  const cells = useMemo(() => getAuraCells(auraType), [auraType])

  // Load state only on client side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    setState(loadState(weekKey))
  }, [weekKey])

  const completedCount = Object.keys(state.completed).length

  const { hasRow, isFull } = useMemo(() => {
    const lines = computeLines()
    const hasLine = lines.some((line) => line.every((idx) => state.completed[cells[Number(idx)]?.id]))
    const full = completedCount === cells.length
    return { hasRow: hasLine, isFull: full }
  }, [completedCount, state.completed, cells])

  useEffect(() => {
    if (mounted) {
      onProgress?.({ completedCount, hasRow, isFull, weekKey })
    }
  }, [completedCount, hasRow, isFull, onProgress, weekKey, mounted])

  const toggle = (cell: BingoCell) => {
    setState((prev) => {
      const next: BingoState = {
        weekKey,
        completed: { ...prev.completed },
      }

      if (next.completed[cell.id]) {
        delete next.completed[cell.id]
      } else {
        next.completed[cell.id] = true
      }

      saveState(next)
      return next
    })
  }

  const reset = () => {
    const next: BingoState = { weekKey, completed: {} }
    saveState(next)
    setState(next)
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">
              <CalendarDays className="h-3.5 w-3.5" />
              {auraType.charAt(0).toUpperCase() + auraType.slice(1)} Bingo
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">A {auraType}-guided week, one square at a time.</h3>
            <p className="mt-1 text-sm text-white/70">
              {auraType === 'ocean' && 'Flow with water-inspired mindfulness activities throughout your week.'}
              {auraType === 'sunset' && 'End each day with sunset-themed reflection and gratitude practices.'}
              {auraType === 'star' && 'Reach for the stars with celestial-inspired daily actions.'}
              {auraType === 'moon' && 'Align with lunar cycles through mindful, moon-themed activities.'}
              {auraType === 'crystal' && 'Clear your energy with crystal-inspired mindfulness practices.'}
              {auraType === 'aurora' && 'Embrace the northern lights with colorful, energizing daily activities.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
              0/{cells.length} done
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {cells.map((cell) => (
            <div
              key={cell.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 px-3 py-4 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold text-white">
                  {cell.label}
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-white/45">Week starts: {weekKey} (UTC)</div>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">
            <CalendarDays className="h-3.5 w-3.5" />
            {auraType.charAt(0).toUpperCase() + auraType.slice(1)} Bingo
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">A {auraType}-guided week, one square at a time.</h3>
          <p className="mt-1 text-sm text-white/70">
            {auraType === 'ocean' && 'Flow with water-inspired mindfulness activities throughout your week.'}
            {auraType === 'sunset' && 'End each day with sunset-themed reflection and gratitude practices.'}
            {auraType === 'star' && 'Reach for the stars with celestial-inspired daily actions.'}
            {auraType === 'moon' && 'Align with lunar cycles through mindful, moon-themed activities.'}
            {auraType === 'crystal' && 'Clear your energy with crystal-inspired mindfulness practices.'}
            {auraType === 'aurora' && 'Embrace the northern lights with colorful, energizing daily activities.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
            {completedCount}/{cells.length} done
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {cells.map((cell) => {
          const isDone = !!state.completed[cell.id]
          return (
            <button
              key={cell.id}
              onClick={() => toggle(cell)}
              className={
                'group relative overflow-hidden rounded-2xl border px-3 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/60 ' +
                (isDone
                  ? 'border-emerald-400/30 bg-emerald-500/10'
                  : 'border-white/10 bg-black/20 hover:bg-black/30')
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div className={isDone ? 'text-sm font-semibold text-emerald-100' : 'text-sm font-semibold text-white'}>
                  {cell.label}
                </div>
                <div className={
                  'flex h-6 w-6 items-center justify-center rounded-full border transition ' +
                  (isDone ? 'border-emerald-400/40 bg-emerald-400/15' : 'border-white/10 bg-white/5')
                }>
                  {isDone ? <Check className="h-4 w-4 text-emerald-200" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/30" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {(hasRow || isFull) && (
        <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2">
              <Trophy className="h-4 w-4 text-amber-200" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-100">
                {isFull ? 'Board complete!' : 'Row unlocked!'}
              </div>
              <div className="mt-1 text-xs text-amber-100/70">
                You can keep playing, or connect a wallet to optionally collect your week on Base.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-white/45">Week starts: {weekKey} (UTC)</div>
    </section>
  )
}
