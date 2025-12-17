'use client'

import { useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import type { PhotoCategory } from '@/lib/photo-storage'

type CategorizeZonesProps = {
  onCategorize: (category: PhotoCategory) => void
  selectedCount: number
  compact?: boolean
}

const CATEGORY_META: Record<PhotoCategory, { label: string; color: string; bgGradient: string }> = {
  dreams: { 
    label: 'Dreams', 
    color: 'bg-blue-500', 
    bgGradient: 'from-blue-500/20 to-blue-600/10' 
  },
  vision: { 
    label: 'Vision', 
    color: 'bg-green-500', 
    bgGradient: 'from-green-500/20 to-green-600/10' 
  },
  manifestation: { 
    label: 'Manifestation', 
    color: 'bg-purple-500', 
    bgGradient: 'from-purple-500/20 to-purple-600/10' 
  }
}

// Updated for Vercel build
export function CategorizeZones({ onCategorize, selectedCount, compact = false }: CategorizeZonesProps) {
  const [dragOverCategory, setDragOverCategory] = useState<PhotoCategory | null>(null)

  function handleDragOver(e: DragEvent<HTMLDivElement>, category: PhotoCategory) {
    e.preventDefault()
    setDragOverCategory(category)
  }

  function handleDragLeave() {
    setDragOverCategory(null)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, category: PhotoCategory) {
    e.preventDefault()
    setDragOverCategory(null)
    onCategorize(category)
  }

  if (selectedCount === 0) return null

  return (
    <div className="mt-6">
      <div className={`text-center mb-4 ${compact ? 'text-sm text-white/80' : 'text-sm text-muted-foreground'}`}>
        Drag selected photos to categorize:
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(CATEGORY_META) as PhotoCategory[]).map(category => {
          const meta = CATEGORY_META[category]
          const isActive = dragOverCategory === category
          
          return (
            <div
              key={category}
              onDragOver={(e) => handleDragOver(e, category)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, category)}
              className={`
                relative rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer
                ${compact 
                  ? `border-white/20 bg-gradient-to-br ${meta.bgGradient} hover:border-white/40` 
                  : `border-border bg-gradient-to-br ${meta.bgGradient} hover:border-${meta.color.split('-')[1]}-300`
                }
                ${isActive ? 'scale-105 border-opacity-60' : ''}
              `}
            >
              <div className={`w-12 h-12 rounded-full ${meta.color} bg-opacity-20 mx-auto mb-3 flex items-center justify-center`}>
                <div className={`w-6 h-6 rounded-full ${meta.color} bg-opacity-80`} />
              </div>
              <div className={`font-medium ${compact ? 'text-white' : 'text-foreground'}`}>
                {meta.label}
              </div>
              <div className={`mt-1 text-xs ${compact ? 'text-white/60' : 'text-muted-foreground'}`}>
                Drop photos here
              </div>
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-white/5 animate-pulse" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
