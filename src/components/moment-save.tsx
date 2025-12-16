'use client'

import { useState, useEffect } from 'react'
import { Star, X, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SavedMoment = {
  id: string
  timestamp: number
  note?: string
  title?: string
  savedAt: Date
}

export function MomentSave() {
  const [isOpen, setIsOpen] = useState(false)
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([])
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [title, setTitle] = useState('')

  // Keyboard shortcut: Cmd+S or Ctrl+S to save current moment
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        captureCurrentTimestamp()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function saveMoment() {
    if (currentTimestamp === null) return

    const moment: SavedMoment = {
      id: Math.random().toString(16).slice(2) + Date.now().toString(16),
      timestamp: currentTimestamp,
      note: note.trim() || undefined,
      title: title.trim() || undefined,
      savedAt: new Date(),
    }

    setSavedMoments((prev) => [...prev, moment])
    setCurrentTimestamp(null)
    setNote('')
    setTitle('')
    setIsOpen(false)
  }

  function captureCurrentTimestamp() {
    setCurrentTimestamp(Date.now())
    setIsOpen(true)
  }

  function formatTimestamp(ms: number) {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={captureCurrentTimestamp}
        className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
        title="Save this moment"
      >
        <Star className="h-4 w-4 text-white/80" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Save This Moment</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Clock className="h-4 w-4" />
                  <span>Timestamp: {currentTimestamp ? formatTimestamp(currentTimestamp) : '--:--'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., My Becoming Moment"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What makes this moment special?"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 resize-none"
                />
              </div>

              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-emerald-300 mt-0.5" />
                  <div className="text-xs text-emerald-200">
                    <div className="font-medium mb-1">Why this is safe</div>
                    <div className="text-emerald-200/80">
                      Your moments are saved locally in your browser. No data is sent to external servers. 
                      You remain in complete control of your memories.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={saveMoment}
                  className="flex-1 bg-white text-slate-900 hover:bg-white/90"
                >
                  Save Moment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {savedMoments.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur z-40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white/80">Saved Moments</h4>
            <span className="text-xs text-white/50">{savedMoments.length}</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedMoments.map((moment) => (
              <div
                key={moment.id}
                className="rounded-lg border border-white/10 bg-black/20 p-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {moment.title && (
                      <div className="text-sm font-medium text-white truncate">{moment.title}</div>
                    )}
                    <div className="text-xs text-white/60">
                      {formatTimestamp(moment.timestamp)}
                    </div>
                  </div>
                  <Star className="h-3 w-3 text-fuchsia-300/60" />
                </div>
                {moment.note && (
                  <div className="mt-1 text-xs text-white/50 line-clamp-2">{moment.note}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
