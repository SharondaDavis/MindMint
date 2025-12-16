'use client'

import { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

type TimelineScrubberProps = {
  duration?: number
  currentTime?: number
  onTimeChange?: (time: number) => void
  onPlay?: () => void
  onPause?: () => void
  isPlaying?: boolean
  compact?: boolean
}

export function TimelineScrubber({ 
  duration = 180, 
  currentTime = 0, 
  onTimeChange,
  onPlay,
  onPause,
  isPlaying = false,
  compact = false 
}: TimelineScrubberProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [localTime, setLocalTime] = useState(currentTime)

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setIsDragging(true)
    updateTime(e)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isDragging) updateTime(e)
  }

  function handleMouseUp() {
    if (isDragging && onTimeChange) {
      onTimeChange(localTime)
    }
    setIsDragging(false)
  }

  function updateTime(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const newTime = percentage * duration
    setLocalTime(newTime)
  }

  function handlePlayPause() {
    if (isPlaying && onPause) {
      onPause()
    } else if (!isPlaying && onPlay) {
      onPlay()
    }
  }

  const progress = duration > 0 ? (localTime / duration) * 100 : 0

  return (
    <div className={`w-full ${compact ? 'space-y-3' : 'space-y-4'}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          className={`rounded-full p-2 transition-colors ${
            compact 
              ? 'bg-white/10 text-white/80 hover:bg-white/20' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <div 
          className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="h-full bg-gradient-to-r from-fuchsia-400 to-sky-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-fuchsia-400 transition-all"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        <div className={`text-xs font-mono ${compact ? 'text-white/60' : 'text-muted-foreground'}`}>
          {formatTime(localTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocalTime(Math.max(0, localTime - 10))}
            className={`rounded-lg p-1.5 transition-colors ${
              compact 
                ? 'text-white/40 hover:text-white/60' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <SkipBack className="h-3 w-3" />
          </button>
          <span className={`text-xs ${compact ? 'text-white/50' : 'text-muted-foreground'}`}>-10s</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs ${compact ? 'text-white/50' : 'text-muted-foreground'}`}>+10s</span>
          <button
            onClick={() => setLocalTime(Math.min(duration, localTime + 10))}
            className={`rounded-lg p-1.5 transition-colors ${
              compact 
                ? 'text-white/40 hover:text-white/60' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <SkipForward className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Moment markers */}
      <div className="relative h-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-white/10" />
          {[0.25, 0.5, 0.75].map(marker => (
            <div
              key={marker}
              className="absolute h-2 w-px bg-white/20"
              style={{ left: `${marker * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
