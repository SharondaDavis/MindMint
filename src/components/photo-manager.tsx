'use client'

import { useState, useEffect } from 'react'
import { Trash2, Clock, Sparkles, Calendar } from 'lucide-react'
import { getStoredPhotos, updatePhotoCategory, removePhoto, type StoredPhoto, type PhotoCategory } from '@/lib/photo-storage'

type PhotoManagerProps = {
  onPhotosChange?: (photos: StoredPhoto[]) => void
}

export function PhotoManager({ onPhotosChange }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<StoredPhoto[]>([])

  useEffect(() => {
    const storedPhotos = getStoredPhotos()
    setPhotos(storedPhotos)
    onPhotosChange?.(storedPhotos)
  }, [onPhotosChange])

  function updateCategory(photoId: string, category: PhotoCategory) {
    updatePhotoCategory(photoId, category)
    const updatedPhotos = getStoredPhotos()
    setPhotos(updatedPhotos)
    onPhotosChange?.(updatedPhotos)
  }

  function deletePhoto(photoId: string) {
    removePhoto(photoId)
    const updatedPhotos = getStoredPhotos()
    setPhotos(updatedPhotos)
    onPhotosChange?.(updatedPhotos)
  }

  function getCategoryIcon(category: PhotoCategory) {
    switch (category) {
      case 'past':
        return <Clock className="h-3 w-3" />
      case 'present':
        return <Sparkles className="h-3 w-3" />
      case 'future':
        return <Calendar className="h-3 w-3" />
    }
  }

  function getCategoryColor(category: PhotoCategory) {
    switch (category) {
      case 'past':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      case 'present':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'future':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    }
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="text-sm text-white/60">
          No photos uploaded yet. Upload photos to get started.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white">Your Photos</h3>
        <p className="mt-1 text-xs text-white/60">
          Select past, present, or future for each photo
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/20 transition hover:border-white/20"
          >
            {/* Photo Preview */}
            <div className="aspect-square overflow-hidden">
              <img
                src={photo.url}
                alt={photo.name}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>

            {/* Category Badge */}
            <div className="absolute top-2 left-2">
              <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${getCategoryColor(photo.category)}`}>
                {getCategoryIcon(photo.category)}
                <span className="capitalize">{photo.category}</span>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => deletePhoto(photo.id)}
              className="absolute top-2 right-2 rounded-lg bg-red-500/80 p-1.5 text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100"
              title="Delete photo"
            >
              <Trash2 className="h-3 w-3" />
            </button>

            {/* Category Selection */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="flex gap-1">
                {(['past', 'present', 'future'] as PhotoCategory[]).map((category) => (
                  <button
                    key={category}
                    onClick={() => updateCategory(photo.id, category)}
                    className={`flex-1 rounded border px-2 py-1 text-xs transition ${
                      photo.category === category
                        ? 'border-white/40 bg-white/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span className="capitalize">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between text-xs text-white/60">
        <div>
          {photos.length} photos total
        </div>
        <div className="flex gap-4">
          <span className="text-amber-300">
            Past: {photos.filter(p => p.category === 'past').length}
          </span>
          <span className="text-emerald-300">
            Present: {photos.filter(p => p.category === 'present').length}
          </span>
          <span className="text-violet-300">
            Future: {photos.filter(p => p.category === 'future').length}
          </span>
        </div>
      </div>
    </div>
  )
}
