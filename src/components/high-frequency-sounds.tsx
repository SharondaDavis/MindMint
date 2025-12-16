'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Volume2, Waves, Brain, Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type HighFrequencySound = {
  id: string
  name: string
  frequency: number
  description: string
  icon: React.ReactNode
  category: 'healing' | 'focus' | 'meditation' | 'energy'
  duration: number
  benefits: string[]
}

const HIGH_FREQUENCY_SOUNDS: HighFrequencySound[] = [
  {
    id: '528hz',
    name: '528 Hz Love Frequency',
    frequency: 528,
    description: 'The miracle tone for transformation and DNA repair',
    icon: <Heart className="h-4 w-4" />,
    category: 'healing',
    duration: 180,
    benefits: ['DNA repair', 'love and compassion', 'stress relief']
  },
  {
    id: '432hz',
    name: '432 Hz Universal Frequency',
    frequency: 432,
    description: 'Universal frequency that resonates with nature',
    icon: <Waves className="h-4 w-4" />,
    category: 'meditation',
    duration: 180,
    benefits: ['Nature kinship', 'deep relaxation', 'harmonious energy']
  },
  {
    id: '741hz',
    name: '741 Hz Awakening Intuition',
    frequency: 741,
    description: 'Cleanses and awakens intuition',
    icon: <Brain className="h-4 w-4" />,
    category: 'meditation',
    duration: 180,
    benefits: ['Intuition enhancement', 'emotional cleansing', 'spiritual awakening']
  },
  {
    id: '396hz',
    name: '396 Hz Liberation Frequency',
    frequency: 396,
    description: 'Liberates from fear and guilt',
    icon: <Sparkles className="h-4 w-4" />,
    category: 'healing',
    duration: 180,
    benefits: ['Fear release', 'guilt liberation', 'emotional freedom']
  },
  {
    id: '639hz',
    name: '639 Hz Connection Frequency',
    frequency: 639,
    description: 'Enhances relationships and connections',
    icon: <Heart className="h-4 w-4" />,
    category: 'healing',
    duration: 180,
    benefits: ['Relationship healing', 'harmonious connections', 'emotional balance']
  },
  {
    id: '963hz',
    name: '963 Hz Divine Frequency',
    frequency: 963,
    description: 'Connects to higher consciousness',
    icon: <Brain className="h-4 w-4" />,
    category: 'meditation',
    duration: 180,
    benefits: ['Higher consciousness', 'spiritual connection', 'crown chakra activation']
  }
]

type HighFrequencySoundsProps = {
  onSoundSelect?: (sound: HighFrequencySound) => void
  selectedSound?: string
  compact?: boolean
}

export function HighFrequencySounds({ onSoundSelect, selectedSound, compact = false }: HighFrequencySoundsProps) {
  const [playingSound, setPlayingSound] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function playSound(soundId: string) {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    setPlayingSound(soundId)
    
    const sound = HIGH_FREQUENCY_SOUNDS.find(s => s.id === soundId)
    if (sound) {
      setTimeout(() => setPlayingSound(null), sound.duration * 1000)
    }
  }

  function stopPlaying() {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setPlayingSound(null)
  }

  function getCategoryColor(category: string) {
    switch (category) {
      case 'healing': return 'from-green-500/20 to-emerald-600/10'
      case 'focus': return 'from-blue-500/20 to-cyan-600/10'
      case 'meditation': return 'from-purple-500/20 to-violet-600/10'
      case 'energy': return 'from-orange-500/20 to-red-600/10'
      default: return 'from-white/10 to-white/5'
    }
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'healing': return <Heart className="h-3 w-3" />
      case 'focus': return <Brain className="h-3 w-3" />
      case 'meditation': return <Brain className="h-3 w-3" />
      case 'energy': return <Sparkles className="h-3 w-3" />
      default: return <Waves className="h-3 w-3" />
    }
  }

  return (
    <div className={`space-y-4 ${compact ? 'w-full' : ''}`}>
      <div className={`text-center ${compact ? 'mb-4' : 'mb-6'}`}>
        <h3 className={`font-medium ${compact ? 'text-sm text-white' : 'text-lg text-white'}`}>
          High-Frequency Sounds
        </h3>
        <p className={`mt-1 ${compact ? 'text-xs text-white/60' : 'text-sm text-white/70'}`}>
          Choose healing frequencies to enhance your mind-movie
        </p>
      </div>

      <div className={`rounded-xl border ${compact ? 'border-white/10 bg-black/20' : 'border-white/10 bg-black/20'} p-3`}>
        <div className="flex items-center gap-3">
          <Volume2 className={`h-4 w-4 ${compact ? 'text-white/60' : 'text-white/70'}`} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <span className={`text-xs ${compact ? 'text-white/60' : 'text-white/70'}`}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {HIGH_FREQUENCY_SOUNDS.map(sound => {
          const isSelected = selectedSound === sound.id
          const isPlaying = playingSound === sound.id
          
          return (
            <div
              key={sound.id}
              onClick={() => onSoundSelect?.(sound)}
              className={`
                relative rounded-2xl border-2 p-4 text-left transition-all cursor-pointer
                ${compact 
                  ? 'border-white/10 bg-gradient-to-br ' + getCategoryColor(sound.category) + ' hover:border-white/20' 
                  : 'border-white/10 bg-gradient-to-br ' + getCategoryColor(sound.category) + ' hover:border-white/20'
                }
                ${isSelected ? 'ring-2 ring-fuchsia-400 border-fuchsia-400' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  rounded-lg p-2 transition-colors
                  ${isSelected ? 'bg-fuchsia-400/20 text-fuchsia-300' : 'text-white/60'}
                `}>
                  {sound.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${compact ? 'text-sm text-white' : 'text-white'} truncate`}>
                    {sound.name}
                  </h4>
                  <div className={`mt-1 text-xs ${compact ? 'text-white/50' : 'text-white/60'}`}>
                    {sound.frequency} Hz • {Math.floor(sound.duration / 60)}min
                  </div>
                  <p className={`mt-2 text-xs ${compact ? 'text-white/40' : 'text-white/50'} line-clamp-2`}>
                    {sound.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {sound.benefits.slice(0, 2).map((benefit, index) => (
                  <span
                    key={index}
                    className={`rounded-full px-2 py-0.5 text-xs ${compact ? 'bg-white/5 text-white/40' : 'bg-white/5 text-white/40'}`}
                  >
                    {benefit}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {getCategoryIcon(sound.category)}
                  <span className={`text-xs ${compact ? 'text-white/40' : 'text-white/50'}`}>
                    {sound.category}
                  </span>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isPlaying) {
                      stopPlaying()
                    } else {
                      playSound(sound.id)
                    }
                  }}
                  size="sm"
                  className={`
                    rounded-full transition-colors
                    ${isPlaying 
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }
                  `}
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 rounded-full bg-fuchsia-400 p-0.5">
                  <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {isPlaying && (
                <div className="absolute inset-0 rounded-2xl border-2 border-fuchsia-400 animate-pulse" />
              )}
            </div>
          )
        })}
      </div>

      {selectedSound && (
        <div className="mt-4 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-fuchsia-200">
              Selected: {HIGH_FREQUENCY_SOUNDS.find(s => s.id === selectedSound)?.name}
            </div>
            <button
              onClick={() => onSoundSelect?.(null as any)}
              className="rounded-full px-2 py-1 text-xs bg-white/10 text-white/60 hover:bg-white/20"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
