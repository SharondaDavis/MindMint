'use client'

import { useMemo, useRef, useState, type DragEvent } from 'react'
import { ArrowLeft, CheckCircle2, ImageIcon, UploadCloud, X } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn, formatBytes } from '@/lib/utils'

type PhotoCategory = 'past' | 'present' | 'future'

type QueuedPhoto = {
  id: string
  file: File
  previewUrl: string
  category: PhotoCategory
}

const CATEGORY_META: Record<PhotoCategory, { label: string; hint: string }> = {
  past: { label: 'Past', hint: 'Moments that shaped you' },
  present: { label: 'Present', hint: 'Your current season' },
  future: { label: 'Future', hint: 'Where you’re going' },
}

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [items, setItems] = useState<QueuedPhoto[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState<null | { ok: boolean; message: string }>(null)

  const counts = useMemo(() => {
    const out: Record<PhotoCategory, number> = { past: 0, present: 0, future: 0 }
    for (const it of items) out[it.category] += 1
    return out
  }, [items])

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const next: QueuedPhoto[] = []

    for (const file of arr) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 10 * 1024 * 1024) continue

      const previewUrl = URL.createObjectURL(file)
      next.push({ id: makeId(), file, previewUrl, category: 'present' })
    }

    setItems((prev) => [...prev, ...next])
  }

  function remove(id: string) {
    setItems((prev: QueuedPhoto[]) => {
      const found = prev.find((p) => p.id === id)
      if (found) URL.revokeObjectURL(found.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  function setCategory(id: string, category: PhotoCategory) {
    setItems((prev: QueuedPhoto[]) => prev.map((p) => (p.id === id ? { ...p, category } : p)))
  }

  async function submit() {
    if (items.length === 0 || submitting) return

    setSubmitting(true)
    setLastResult(null)

    try {
      const body = new FormData()
      for (const it of items) {
        body.append('photos', it.file)
        body.append('categories', it.category)
      }

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body,
      })

      const json = (await res.json()) as { ok: boolean; message?: string }
      setLastResult({ ok: Boolean(json.ok), message: json.message ?? (json.ok ? 'Uploaded.' : 'Upload failed.') })

      if (json.ok) {
        for (const it of items) URL.revokeObjectURL(it.previewUrl)
        setItems([])
      }
    } catch (e) {
      setLastResult({ ok: false, message: e instanceof Error ? e.message : 'Upload failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="text-sm text-muted-foreground">Max 10MB per image</div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Upload your photos</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add moments from your past, present, and future. You’ll mint them into a mind-movie.
                </p>
              </div>
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                <UploadCloud className="mr-2 h-4 w-4" />
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
                'mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-8 transition-colors',
                'cursor-pointer hover:bg-muted/40'
              )}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-2xl border border-border bg-background p-3">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium">Drag & drop images here</div>
                  <div className="mt-1 text-xs text-muted-foreground">or click to select from your device</div>
                </div>
              </div>
            </div>

            {items.length > 0 ? (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {items.length} selected
                    <span className="ml-2">Past: {counts.past}</span>
                    <span className="ml-2">Present: {counts.present}</span>
                    <span className="ml-2">Future: {counts.future}</span>
                  </div>
                  <Button onClick={submit} disabled={submitting}>
                    {submitting ? 'Uploading…' : 'Upload to MindMint'}
                  </Button>
                </div>

                {lastResult ? (
                  <div className={cn('mt-4 rounded-xl border px-4 py-3 text-sm', lastResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900')}>
                    <div className="flex items-center gap-2">
                      {lastResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      <span>{lastResult.message}</span>
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {items.map((it) => (
                    <div key={it.id} className="group rounded-2xl border border-border bg-card p-3">
                      <div className="flex gap-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted">
                          <img src={it.previewUrl} alt={it.file.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{it.file.name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{formatBytes(it.file.size)}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(Object.keys(CATEGORY_META) as PhotoCategory[]).map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(it.id, cat)}
                                className={cn(
                                  'rounded-full px-2.5 py-1 text-xs transition-colors',
                                  it.category === cat
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                                )}
                                title={CATEGORY_META[cat].hint}
                              >
                                {CATEGORY_META[cat].label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={() => remove(it.id)}
                          aria-label={`Remove ${it.file.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                Tip: start with 3–6 photos per category for a smooth first mind-movie.
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="text-base font-semibold">How MindMint uses these</h2>
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="font-medium text-foreground">Past</div>
                <div className="mt-1">Memory anchors and motifs.</div>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="font-medium text-foreground">Present</div>
                <div className="mt-1">Your current baseline and mood palette.</div>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="font-medium text-foreground">Future</div>
                <div className="mt-1">A visual intention-set for what’s next.</div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <div className="text-sm font-medium text-foreground">Next</div>
              <p className="mt-1 text-sm text-muted-foreground">After upload, you’ll generate your kaleidoscope mind-movie.</p>
              <div className="mt-3">
                <Link href="/create" className="text-sm font-medium text-primary hover:underline">
                  Go to Create
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
