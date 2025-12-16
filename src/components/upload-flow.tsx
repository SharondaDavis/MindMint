'use client'

import { useMemo, useRef, useState, useEffect, type DragEvent } from 'react'
import { ArrowLeft, CheckCircle2, ImageIcon, UploadCloud, X } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn, formatBytes } from '@/lib/utils'
import { getStoredPhotos, addPhoto, updatePhotoCategory, removePhoto, hasPhotosInAllCategories, type PhotoCategory, type StoredPhoto } from '@/lib/photo-storage'

export type { PhotoCategory }

const CATEGORY_META: Record<PhotoCategory, { label: string; hint: string }> = {
  past: { label: 'Past', hint: 'Moments that shaped you' },
  present: { label: 'Present', hint: 'Your current season' },
  future: { label: 'Future', hint: 'Where you\'re going' },
}

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export function UploadFlow({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [items, setItems] = useState<StoredPhoto[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState<null | { ok: boolean; message: string }>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  // Load stored photos on mount
  useEffect(() => {
    setItems(getStoredPhotos())
  }, [])

  const counts = useMemo(() => {
    const out: Record<PhotoCategory, number> = { past: 0, present: 0, future: 0 }
    for (const it of items) out[it.category] += 1
    return out
  }, [items])

  const canCreateMovie = hasPhotosInAllCategories()

  function toggleSelection(id: string) {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function applyCategoryToSelected(category: PhotoCategory) {
    items.forEach(item => {
      if (selectedItems.has(item.id)) {
        updatePhotoCategory(item.id, category)
      }
    })
    setItems(getStoredPhotos())
    setSelectedItems(new Set())
  }

  function selectAll() {
    setSelectedItems(new Set(items.map(item => item.id)))
  }

  function clearSelection() {
    setSelectedItems(new Set())
  }

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files)

    for (const file of arr) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 10 * 1024 * 1024) continue

      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        const newPhoto = addPhoto({
          id: makeId(),
          url,
          category: 'present', // Default category
          name: file.name,
          size: file.size
        })
        setItems(prev => [...prev, newPhoto])
      }
      reader.readAsDataURL(file)
    }
  }

  function remove(id: string) {
    removePhoto(id)
    setItems(prev => prev.filter(p => p.id !== id))
  }

  function setCategory(id: string, category: PhotoCategory) {
    updatePhotoCategory(id, category)
    setItems(getStoredPhotos())
  }

  async function submit() {
    if (items.length === 0 || submitting) return

    setSubmitting(true)
    setLastResult(null)

    try {
      // Photos are already stored in localStorage, just show success
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastResult({ ok: true, message: 'Photos saved successfully!' })
    } catch (e) {
      setLastResult({ ok: false, message: e instanceof Error ? e.message : 'Save failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const containerClasses = compact
    ? 'rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur'
    : 'rounded-2xl border border-border bg-card p-5 md:p-6'

  return (
    <section className={containerClasses}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className={compact ? 'text-lg font-semibold tracking-tight text-white' : 'text-2xl font-semibold tracking-tight'}>
            {compact ? 'Upload photos' : 'Upload your photos'}
          </h1>
          <p className={compact ? 'mt-1 text-xs text-white' : 'mt-1 text-sm text-muted-foreground'}>
            {compact
              ? 'Drag & drop images or click to select'
              : 'Add moments from your past, present, and future. You’ll mint them into a mind-movie.'}
          </p>
        </div>
        <Button variant="outline" onClick={() => inputRef.current?.click()} className="text-white border-white/20 hover:bg-white/10 hover:text-white">
          <UploadCloud className="mr-2 h-4 w-4 text-white" />
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.currentTarget.value = ''
          }}
        />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'mt-6 rounded-2xl border border-dashed p-8 transition-colors cursor-pointer',
          compact
            ? 'border-white/15 bg-white/5 hover:bg-white/10'
            : 'border-border bg-muted/30 hover:bg-muted/40'
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={cn('rounded-2xl border p-3', compact ? 'border-white/15 bg-white/5' : 'border-border bg-background')}>
            <ImageIcon className={cn('h-6 w-6', compact ? 'text-white/60' : 'text-muted-foreground')} />
          </div>
          <div>
            <div className={cn('text-sm font-medium', compact ? 'text-white/80' : '')}>Drag & drop images here</div>
            <div className={cn('mt-1 text-xs', compact ? 'text-white/50' : 'text-muted-foreground')}>
              or click to select from your device
            </div>
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn('text-sm', compact ? 'text-white' : 'text-muted-foreground')}>
              {items.length} photos
              <span className="ml-2">Past: {counts.past}</span>
              <span className="ml-2">Present: {counts.present}</span>
              <span className="ml-2">Future: {counts.future}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={cn(
                  'rounded-lg p-2 text-xs transition-colors',
                  compact
                    ? 'text-white/60 hover:bg-white/10 hover:text-white/80'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {viewMode === 'grid' ? 'List' : 'Grid'}
              </button>
            </div>
          </div>

          {selectedItems.size > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white">
              <div className="flex items-center justify-between mb-3">
                <span>Batch categorize {selectedItems.size} selected photos</span>
                <button onClick={clearSelection} className="text-xs text-white/60 hover:text-white">
                  Clear selection
                </button>
              </div>
              <div className="flex gap-2">
                {(['past', 'present', 'future'] as PhotoCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => applyCategoryToSelected(cat)}
                    className={cn(
                      'flex-1 rounded px-2 py-1 text-xs font-medium transition-colors',
                      cat === 'past' ? 'bg-blue-500 text-white' :
                      cat === 'present' ? 'bg-green-500 text-white' :
                      'bg-purple-500 text-white'
                    )}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={cn(
            'grid gap-3',
            viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
          )}>
            {items.map((it) => (
              <div
                key={it.id}
                className={cn(
                  'group relative rounded-2xl border p-3 transition-all cursor-pointer',
                  compact ? 'border-white/10 bg-black/20' : 'border-border bg-card',
                  selectedItems.has(it.id) && 'ring-2 ring-fuchsia-400 ring-offset-2 ring-offset-black/20'
                )}
                onClick={() => toggleSelection(it.id)}
              >
                <div className="aspect-square relative overflow-hidden rounded-xl mb-2">
                  <img src={it.url} alt={it.name} className="h-full w-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <div className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      it.category === 'past' ? 'bg-blue-500/80 text-white' :
                      it.category === 'present' ? 'bg-green-500/80 text-white' :
                      'bg-purple-500/80 text-white'
                    )}>
                      {it.category}
                    </div>
                  </div>
                  {selectedItems.has(it.id) && (
                    <div className="absolute top-2 left-2">
                      <div className="rounded-full bg-fuchsia-400 p-1">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Quick category selection buttons */}
                <div className="flex gap-1 mb-2">
                  {(['past', 'present', 'future'] as PhotoCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCategory(it.id, cat)
                      }}
                      className={cn(
                        'flex-1 rounded px-1 py-0.5 text-xs font-medium transition-colors',
                        it.category === cat
                          ? cat === 'past' ? 'bg-blue-500 text-white' :
                            cat === 'present' ? 'bg-green-500 text-white' :
                            'bg-purple-500 text-white'
                          : compact ? 'bg-white/10 text-white/60 hover:bg-white/20' : 'bg-muted text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div className="text-xs text-white/80 truncate">{it.name}</div>
                <div className="text-xs text-white/50">{formatBytes(it.size)}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  compact
                    ? 'bg-white/10 text-white/60 hover:bg-white/20'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                Select all
              </button>
            </div>
            <div className="flex items-center gap-3">
              {!canCreateMovie && items.length > 0 && (
                <div className="text-xs text-amber-400">
                  Add photos to all seasons to enable movie creation
                </div>
              )}
              <Button onClick={submit} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Photos'}
              </Button>
              {canCreateMovie && (
                <Link href="/create" className="inline-flex items-center justify-center rounded-md bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-600">
                  Create Movie
                </Link>
              )}
            </div>
          </div>

          {lastResult ? (
            <div
              className={cn(
                'mt-4 rounded-xl border px-4 py-3 text-sm',
                lastResult.ok
                  ? compact
                    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : compact
                  ? 'border-red-400/30 bg-red-500/10 text-red-200'
                  : 'border-red-200 bg-red-50 text-red-900'
              )}
            >
              <div className="flex items-center gap-2">
                {lastResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <span>{lastResult.message}</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={cn('mt-6 rounded-xl border p-4 text-sm', compact ? 'border-white/10 bg-white/5 text-white/50' : 'border-border bg-muted/20 text-muted-foreground')}>
          Tip: start with 3–6 photos per category for a smooth first mind-movie.
        </div>
      )}
    </section>
  )
}
