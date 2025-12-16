'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getChronologicalPhotos, type StoredPhoto } from '@/lib/photo-storage'

type Phase = 'idle' | 'introKaleidoscope' | 'mindMovie' | 'ended'

type MotionParams = {
  startScale: number
  endScale: number
  startX: number
  startY: number
  endX: number
  endY: number
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function hashToUnit(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

async function loadImageBitmap(src: string): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    const res = await fetch(src)
    const blob = await res.blob()
    return await createImageBitmap(blob)
  }

  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
  return img
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: ImageBitmap | HTMLImageElement,
  canvasW: number,
  canvasH: number,
  scale: number,
  panX: number,
  panY: number
) {
  const iw = 'width' in image ? image.width : (image as any).width
  const ih = 'height' in image ? image.height : (image as any).height

  const base = Math.max(canvasW / iw, canvasH / ih)
  const drawW = iw * base * scale
  const drawH = ih * base * scale

  const maxPanX = Math.max(0, (drawW - canvasW) / 2)
  const maxPanY = Math.max(0, (drawH - canvasH) / 2)

  const dx = (canvasW - drawW) / 2 + panX * maxPanX
  const dy = (canvasH - drawH) / 2 + panY * maxPanY

  ctx.drawImage(image as any, dx, dy, drawW, drawH)
}

async function extractPalette(photos: StoredPhoto[], bitmaps: Map<string, ImageBitmap | HTMLImageElement>) {
  // Small, fast dominant-ish palette: average per-image color + pick 5 most distinct.
  const tmp = document.createElement('canvas')
  const size = 32
  tmp.width = size
  tmp.height = size
  const tctx = tmp.getContext('2d', { willReadFrequently: true })
  if (!tctx) return ['#7c3aed', '#06b6d4', '#f472b6', '#a78bfa', '#38bdf8']

  const samples: Array<{ r: number; g: number; b: number }> = []

  for (const p of photos) {
    const img = bitmaps.get(p.id)
    if (!img) continue

    tctx.clearRect(0, 0, size, size)
    try {
      tctx.drawImage(img as any, 0, 0, size, size)
      const data = tctx.getImageData(0, 0, size, size).data
      let r = 0
      let g = 0
      let b = 0
      let count = 0

      for (let i = 0; i < data.length; i += 16) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        count++
      }

      if (count > 0) {
        samples.push({ r: r / count, g: g / count, b: b / count })
      }
    } catch {
      // ignore
    }
  }

  if (samples.length === 0) return ['#7c3aed', '#06b6d4', '#f472b6', '#a78bfa', '#38bdf8']

  const picked: Array<{ r: number; g: number; b: number }> = []
  picked.push(samples[0])

  while (picked.length < 5 && picked.length < samples.length) {
    let bestIdx = -1
    let bestScore = -1

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i]
      let minDist = Infinity
      for (const p of picked) {
        const dr = s.r - p.r
        const dg = s.g - p.g
        const db = s.b - p.b
        const d = dr * dr + dg * dg + db * db
        minDist = Math.min(minDist, d)
      }
      if (minDist > bestScore) {
        bestScore = minDist
        bestIdx = i
      }
    }

    if (bestIdx >= 0) picked.push(samples[bestIdx])
    else break
  }

  return picked.map(c => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`)
}

function drawIntroKaleidoscope(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  palette: string[]
) {
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2
  const baseRot = t * 0.00025
  const segments = 12

  // Background wash
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6)
  bg.addColorStop(0, palette[0] ?? '#7c3aed')
  bg.addColorStop(1, 'rgba(0,0,0,0.9)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < segments; i++) {
    const a0 = (Math.PI * 2 * i) / segments + baseRot
    const a1 = (Math.PI * 2 * (i + 1)) / segments + baseRot

    const p = palette[i % palette.length] ?? '#06b6d4'
    const pulse = 0.45 + 0.35 * Math.sin(t * 0.002 + i)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(a0)

    ctx.globalAlpha = 0.55
    ctx.fillStyle = p

    ctx.beginPath()
    ctx.moveTo(0, 0)
    const r1 = Math.min(w, h) * (0.15 + pulse * 0.35)
    const r2 = Math.min(w, h) * (0.35 + pulse * 0.45)
    ctx.lineTo(r2, -r1)
    ctx.lineTo(r2, r1)
    ctx.closePath()
    ctx.fill()

    // Inner shimmer
    ctx.globalAlpha = 0.22
    ctx.fillStyle = palette[(i + 2) % palette.length] ?? '#f472b6'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(r2 * 0.72, -r1 * 0.6)
    ctx.lineTo(r2 * 0.72, r1 * 0.6)
    ctx.closePath()
    ctx.fill()

    // Mirror slice (cheap kaleidoscope feel)
    ctx.scale(1, -1)
    ctx.globalAlpha = 0.18
    ctx.fillStyle = palette[(i + 3) % palette.length] ?? '#a78bfa'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(r2 * 0.9, -r1 * 0.35)
    ctx.lineTo(r2 * 0.9, r1 * 0.35)
    ctx.closePath()
    ctx.fill()

    ctx.restore()

    // Soft ring
    ctx.save()
    ctx.translate(cx, cy)
    ctx.globalAlpha = 0.06
    ctx.strokeStyle = p
    ctx.lineWidth = 2
    const rr = Math.min(w, h) * (0.18 + 0.08 * Math.sin(t * 0.001 + i))
    ctx.beginPath()
    ctx.arc(0, 0, rr, a0, a1)
    ctx.stroke()
    ctx.restore()
  }

  // Center glow
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.35)
  g.addColorStop(0, 'rgba(255,255,255,0.25)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

export function InductionMindMovieCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const [photos, setPhotos] = useState<StoredPhoto[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [totalDurationSec, setTotalDurationSec] = useState<30 | 45 | 60>(45)
  const [introDurationSec, setIntroDurationSec] = useState<3 | 4 | 5 | 6 | 7>(5)

  const phaseStartRef = useRef<number>(0)
  const playbackStartRef = useRef<number>(0)

  const [palette, setPalette] = useState<string[]>(['#7c3aed', '#06b6d4', '#f472b6', '#a78bfa', '#38bdf8'])
  const bitmapsRef = useRef<Map<string, ImageBitmap | HTMLImageElement>>(new Map())
  const motionRef = useRef<Map<string, MotionParams>>(new Map())

  const introTickRef = useRef(0)
  const [introTick, setIntroTick] = useState(0)

  const mindMovieDurationMs = useMemo(() => {
    const total = totalDurationSec * 1000
    const intro = introDurationSec * 1000
    return Math.max(0, total - intro)
  }, [totalDurationSec, introDurationSec])

  const introDurationMs = introDurationSec * 1000

  function refreshPhotos() {
    const next = getChronologicalPhotos()
    setPhotos(next)
  }

  useEffect(() => {
    refreshPhotos()

    function onStorage(e: StorageEvent) {
      if (e.key === 'mindmint-photos') refreshPhotos()
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Preload images + compute palette (once per photo set)
  useEffect(() => {
    let cancelled = false

    async function run() {
      const map = new Map<string, ImageBitmap | HTMLImageElement>()
      for (const p of photos) {
        try {
          const img = await loadImageBitmap(p.url)
          if (cancelled) return
          map.set(p.id, img)
        } catch {
          // ignore
        }
      }

      if (cancelled) return
      bitmapsRef.current = map

      // Motion params per photo (deterministic)
      const motion = new Map<string, MotionParams>()
      for (const p of photos) {
        const a = hashToUnit(p.id + 'a')
        const b = hashToUnit(p.id + 'b')
        const c = hashToUnit(p.id + 'c')
        const d = hashToUnit(p.id + 'd')
        const panLimit = 0.35
        motion.set(p.id, {
          // Reel-like Ken Burns (subtle). Large pans can feel like the image is "floating".
          startScale: lerp(1.02, 1.06, a),
          endScale: lerp(1.06, 1.10, b),
          startX: lerp(-panLimit, panLimit, c),
          startY: lerp(-panLimit, panLimit, d),
          endX: lerp(-panLimit, panLimit, a),
          endY: lerp(-panLimit, panLimit, b),
        })
      }
      motionRef.current = motion

      const pal = await extractPalette(photos, map)
      if (cancelled) return
      setPalette(pal)
    }

    run()

    return () => {
      cancelled = true
    }
  }, [photos])

  function stop() {
    setPhase('idle')
  }

  function play() {
    if (photos.length === 0) return

    setPhase('introKaleidoscope')
    const now = performance.now()
    phaseStartRef.current = now
    playbackStartRef.current = 0
  }

  // Phase switching timer
  useEffect(() => {
    if (phase !== 'introKaleidoscope') return

    const id = window.setTimeout(() => {
      setPhase('mindMovie')
      playbackStartRef.current = performance.now()
    }, introDurationMs)

    return () => window.clearTimeout(id)
  }, [phase, introDurationMs])

  // Render loop
  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const ctx2d = canvasEl.getContext('2d')
    if (!ctx2d) return

    const canvas = canvasEl
    const ctx = ctx2d

    const dpr = Math.min(2, window.devicePixelRatio || 1)

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width * dpr))
      const h = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }

    function draw(now: number) {
      resize()

      const w = canvas.width
      const h = canvas.height

      // Frame budget: keep it light.
      if (phase === 'introKaleidoscope') {
        drawIntroKaleidoscope(ctx, w, h, now, palette)

        // Keep the progress ring moving without forcing heavy re-renders.
        // Updating at ~20fps is plenty for a subtle countdown.
        if (now - introTickRef.current > 50) {
          introTickRef.current = now
          setIntroTick(now)
        }
      } else if (phase === 'mindMovie') {
        ctx.clearRect(0, 0, w, h)

        const start = playbackStartRef.current || now
        const elapsed = Math.max(0, now - start)

        if (elapsed >= mindMovieDurationMs || photos.length === 0) {
          setPhase('ended')
        } else {
          const slice = mindMovieDurationMs / Math.max(1, photos.length)
          const idx = Math.min(photos.length - 1, Math.floor(elapsed / slice))
          const local = (elapsed - idx * slice) / slice

          // Slightly longer crossfade = more cinematic reel.
          const fadeFrac = 0.3
          const fade = clamp01((local - (1 - fadeFrac)) / fadeFrac)

          const curr = photos[idx]
          const next = photos[Math.min(photos.length - 1, idx + 1)]

          const currImg = bitmapsRef.current.get(curr.id)
          const nextImg = bitmapsRef.current.get(next.id)

          const currMotion = motionRef.current.get(curr.id)
          const nextMotion = motionRef.current.get(next.id)

          // subtle cinematic grade
          ctx.fillStyle = 'rgba(0,0,0,1)'
          ctx.fillRect(0, 0, w, h)
          ctx.save()
          ctx.filter = 'contrast(1.08) saturate(1.06) brightness(1.02)'

          if (currImg && currMotion) {
            ctx.globalAlpha = 1 - fade
            const s = lerp(currMotion.startScale, currMotion.endScale, local)
            const px = lerp(currMotion.startX, currMotion.endX, local)
            const py = lerp(currMotion.startY, currMotion.endY, local)
            drawCover(ctx, currImg, w, h, s, px, py)
          }

          if (nextImg && nextMotion && idx + 1 < photos.length) {
            ctx.globalAlpha = fade
            const s = lerp(nextMotion.startScale, nextMotion.endScale, local)
            const px = lerp(nextMotion.startX, nextMotion.endX, local)
            const py = lerp(nextMotion.startY, nextMotion.endY, local)
            drawCover(ctx, nextImg, w, h, s, px, py)
          }

          ctx.restore()

          // cinematic letterbox hint (very subtle)
          ctx.save()
          ctx.globalAlpha = 0.25
          ctx.fillStyle = 'rgba(0,0,0,1)'
          const bar = Math.round(h * 0.08)
          ctx.fillRect(0, 0, w, bar)
          ctx.fillRect(0, h - bar, w, bar)
          ctx.restore()
        }
      } else if (phase === 'ended') {
        // Hold last frame; no-op.
      } else {
        // idle
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const g = ctx.createLinearGradient(0, 0, w, h)
        g.addColorStop(0, 'rgba(124,58,237,0.25)')
        g.addColorStop(1, 'rgba(14,165,233,0.15)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => {
      // trigger a resize on next frame
    })
    ro.observe(canvas)

    return () => {
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase, photos, palette, mindMovieDurationMs])

  const introProgress = useMemo(() => {
    if (phase !== 'introKaleidoscope') return 0
    const now = performance.now()
    return clamp01((now - phaseStartRef.current) / introDurationMs)
  }, [phase, introDurationMs, introTick])

  const canPlay = photos.length > 0

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-medium text-white">Playback</div>
          <div className="mt-1 text-xs text-white/80">
            Intro induction kaleidoscope then cinematic mind-movie.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-white/80">
            Total
            <select
              className="ml-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
              value={totalDurationSec}
              onChange={(e) => setTotalDurationSec(Number(e.target.value) as 30 | 45 | 60)}
            >
              <option value={30}>30s</option>
              <option value={45}>45s</option>
              <option value={60}>60s</option>
            </select>
          </label>

          <label className="text-xs text-white/80">
            Intro
            <select
              className="ml-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
              value={introDurationSec}
              onChange={(e) => setIntroDurationSec(Number(e.target.value) as 3 | 4 | 5 | 6 | 7)}
            >
              <option value={3}>3s</option>
              <option value={4}>4s</option>
              <option value={5}>5s</option>
              <option value={6}>6s</option>
              <option value={7}>7s</option>
            </select>
          </label>

          <button
            onClick={refreshPhotos}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-white/90 hover:bg-black/30"
          >
            Refresh photos
          </button>

          {phase === 'idle' || phase === 'ended' ? (
            <button
              onClick={play}
              disabled={!canPlay}
              className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
            >
              Play
            </button>
          ) : (
            <button
              onClick={stop}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold text-white hover:bg-black/30"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        <canvas ref={canvasRef} className="h-[360px] w-full md:h-[440px]" />

        {phase === 'introKaleidoscope' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm font-medium tracking-wide text-white/90">Breathe…</div>
              <div className="relative h-16 w-16">
                <svg viewBox="0 0 100 100" className="h-16 w-16">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(217,70,239,0.85)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={(1 - introProgress) * 2 * Math.PI * 42}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {photos.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium text-white">Upload some photos first</div>
              <div className="mt-1 text-xs text-white/70">
                Then press Play to start the induction + mind-movie.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-white/70">
        <div>Phase: <span className="text-white/90">{phase}</span></div>
        <div>
          Mind-movie: <span className="text-white/90">{Math.round(mindMovieDurationMs / 1000)}s</span>
        </div>
      </div>
    </div>
  )
}
