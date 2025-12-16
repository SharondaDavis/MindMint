'use client'

import { useState } from 'react'
import { Palette, Zap, Heart, Moon, Sun, Cloud } from 'lucide-react'

type MoodTemplate = {
  id: string
  name: string
  icon: React.ReactNode
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  transitions: {
    speed: 'slow' | 'medium' | 'fast'
    effect: 'fade' | 'slide' | 'kaleidoscope' | 'morph'
  }
  description: string
}

const MOOD_TEMPLATES: MoodTemplate[] = [
  {
    id: 'dreamy',
    name: 'Dreamy',
    icon: <Moon className="h-4 w-4" />,
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899', 
      accent: '#06B6D4',
      background: '#1E1B4B'
    },
    transitions: {
      speed: 'slow',
      effect: 'fade'
    },
    description: 'Soft, ethereal transitions with purple and pink hues'
  },
  {
    id: 'energetic',
    name: 'Energetic',
    icon: <Zap className="h-4 w-4" />,
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      accent: '#10B981',
      background: '#451A03'
    },
    transitions: {
      speed: 'fast',
      effect: 'kaleidoscope'
    },
    description: 'Dynamic, vibrant colors with rapid kaleidoscope effects'
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic',
    icon: <Heart className="h-4 w-4" />,
    colors: {
      primary: '#F97316',
      secondary: '#A855F7',
      accent: '#6366F1',
      background: '#431407'
    },
    transitions: {
      speed: 'medium',
      effect: 'slide'
    },
    description: 'Warm, sentimental tones with gentle sliding transitions'
  },
  {
    id: 'serene',
    name: 'Serene',
    icon: <Cloud className="h-4 w-4" />,
    colors: {
      primary: '#06B6D4',
      secondary: '#10B981',
      accent: '#3B82F6',
      background: '#083344'
    },
    transitions: {
      speed: 'slow',
      effect: 'morph'
    },
    description: 'Calm, flowing blues and greens with morphing effects'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    icon: <Sun className="h-4 w-4" />,
    colors: {
      primary: '#EC4899',
      secondary: '#F59E0B',
      accent: '#EF4444',
      background: '#7F1D1D'
    },
    transitions: {
      speed: 'medium',
      effect: 'kaleidoscope'
    },
    description: 'Bold, bright colors with energetic kaleidoscope patterns'
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    icon: <Palette className="h-4 w-4" />,
    colors: {
      primary: '#8B5CF6',
      secondary: '#3B82F6',
      accent: '#06B6D4',
      background: '#0F172A'
    },
    transitions: {
      speed: 'medium',
      effect: 'morph'
    },
    description: 'Deep space colors with cosmic morphing transitions'
  }
]

type MoodTemplatesProps = {
  onTemplateSelect?: (template: MoodTemplate) => void
  selectedTemplate?: string
  compact?: boolean
}

export function MoodTemplates({ onTemplateSelect, selectedTemplate, compact = false }: MoodTemplatesProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  return (
    <div className={`space-y-4 ${compact ? 'w-full' : ''}`}>
      <div className={`text-center ${compact ? 'mb-4' : 'mb-6'}`}>
        <h3 className={`font-medium ${compact ? 'text-sm text-white' : 'text-lg text-white'}`}>
          Choose Your Mood
        </h3>
        <p className={`mt-1 ${compact ? 'text-xs text-white/60' : 'text-sm text-white/70'}`}>
          Select a template to set the tone for your mind-movie
        </p>
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3'}`}>
        {MOOD_TEMPLATES.map(template => {
          const isSelected = selectedTemplate === template.id
          const isHovered = hoveredTemplate === template.id

          return (
            <button
              key={template.id}
              onClick={() => onTemplateSelect?.(template)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={`
                relative rounded-2xl border-2 p-4 text-left transition-all
                ${compact 
                  ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10' 
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }
                ${isSelected ? 'ring-2 ring-fuchsia-400 border-fuchsia-400' : ''}
                ${isHovered ? 'scale-105' : ''}
              `}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`
                  rounded-lg p-2 transition-colors
                  ${isSelected ? 'bg-fuchsia-400/20 text-fuchsia-300' : 'text-white/60'}
                `}>
                  {template.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${compact ? 'text-sm text-white' : 'text-white'}`}>
                    {template.name}
                  </h4>
                  <p className={`mt-0.5 ${compact ? 'text-xs text-white/50' : 'text-xs text-white/60'}`}>
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Color palette preview */}
              <div className="flex gap-1 mb-2">
                {Object.values(template.colors).slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Transition info */}
              <div className="flex items-center justify-between">
                <span className={`text-xs ${compact ? 'text-white/40' : 'text-white/50'}`}>
                  {template.transitions.speed} • {template.transitions.effect}
                </span>
                {isSelected && (
                  <div className="rounded-full bg-fuchsia-400 p-0.5">
                    <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Hover effect overlay */}
              {isHovered && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>

      {selectedTemplate && (
        <div className="mt-4 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-3">
          <div className="flex items-center gap-2">
            <div className="text-sm text-fuchsia-200">
              Template selected: {MOOD_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
            </div>
            <button
              onClick={() => onTemplateSelect?.(null as any)}
              className="ml-auto rounded-full px-2 py-1 text-xs bg-white/10 text-white/60 hover:bg-white/20"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
