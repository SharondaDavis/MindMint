'use client'

import { forwardRef } from 'react'

type AuraCardProps = {
  auraName: string
  auraEmoji: string
  keywords: string[]
  affirmation: string
  dateLabel: string
}

export const AuraCard = forwardRef<HTMLDivElement, AuraCardProps>(function AuraCard(
  { auraName, auraEmoji, keywords, affirmation, dateLabel },
  ref
) {
  return (
    <div
      ref={ref}
      className="h-[540px] w-[540px] rounded-[36px] bg-gradient-to-br from-[#16062f] via-[#1d0f57] to-[#0b1028] p-10 text-white"
    >
      <div className="text-xs uppercase tracking-[0.25em] text-white/60">{dateLabel}</div>
      <div className="mt-6 text-4xl font-semibold">
        {auraEmoji} {auraName}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {keywords.map((word) => (
          <span
            key={word}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]"
          >
            {word}
          </span>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-lg">
        {affirmation}
      </div>
      <div className="mt-8 text-xs uppercase tracking-[0.3em] text-white/50">MindMint</div>
    </div>
  )
})
