'use client'

import { useMemo, useState } from 'react'
import { Copy, Download, X } from 'lucide-react'

const SHARE_VARIANTS = {
  calm: 'I just took a 60-second aura reset on MindMint. Breathe, spin, and receive guidance. Try it:',
  playful: 'Spun my aura wheel 🌀 60 seconds, instant reset. Your turn:',
  human: 'One quiet minute for myself. Aura, affirmation, and a little clarity. Join me:',
}

type SharePayload = {
  auraName: string
  auraEmoji: string
  auraKeywords: string[]
  affirmation: string
  dateLabel: string
  isPractice: boolean
  duration: number
}

export function ShareModal({
  open,
  onClose,
  referralCode,
  sharePayload,
  onShare,
  onCopyLink,
  onDownload,
}: {
  open: boolean
  onClose: () => void
  referralCode: string
  sharePayload: SharePayload | null
  onShare: (platform: 'x' | 'farcaster' | 'linkedin') => void
  onCopyLink: () => void
  onDownload: () => void
}) {
  const [variant, setVariant] = useState<'calm' | 'playful' | 'human'>('calm')

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const base = window.location.origin
    return `${base}/?ref=${referralCode}`
  }, [referralCode])

  if (!open || !sharePayload) return null

  const text = SHARE_VARIANTS[variant]
  const shareText = `${text} ${shareUrl}`

  const shareLinks = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    farcaster: `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0a1d] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">Save + share</div>
            <h3 className="mt-2 text-xl font-semibold">Your aura card is ready</h3>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70"
            aria-label="Close share modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">{sharePayload.dateLabel}</div>
          <div className="mt-2 text-2xl font-semibold">
            {sharePayload.auraEmoji} {sharePayload.auraName}
          </div>
          <div className="mt-2 text-sm text-white/70">{sharePayload.affirmation}</div>
        </div>

        <div className="mt-4">
          <div className="text-xs uppercase tracking-[0.25em] text-white/50">Share tone</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['calm', 'playful', 'human'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setVariant(key)}
                className={
                  'rounded-full border px-3 py-1 text-xs transition ' +
                  (variant === key
                    ? 'border-white/40 bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10')
                }
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {(['x', 'farcaster', 'linkedin'] as const).map((platform) => (
            <a
              key={platform}
              href={shareLinks[platform]}
              target="_blank"
              rel="noreferrer"
              onClick={() => onShare(platform)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/10"
            >
              {platform}
            </a>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={async () => {
              if (shareUrl) {
                try {
                  await navigator.clipboard.writeText(shareUrl)
                } catch {
                  return
                }
              }
              onCopyLink()
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy link
          </button>
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80"
          >
            <Download className="h-3.5 w-3.5" />
            Download card
          </button>
        </div>

        <p className="mt-4 text-xs text-white/50">
          Share or copy to unlock a bonus moment for your next session.
        </p>
      </div>
    </div>
  )
}
