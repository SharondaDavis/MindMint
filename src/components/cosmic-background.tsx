import type { ReactNode } from 'react'

type Star = {
  cx: number
  cy: number
  r: number
  opacity: number
}

const STARS: Star[] = [
  { cx: 6, cy: 10, r: 0.22, opacity: 0.55 },
  { cx: 12, cy: 34, r: 0.18, opacity: 0.45 },
  { cx: 18, cy: 22, r: 0.25, opacity: 0.7 },
  { cx: 23, cy: 62, r: 0.2, opacity: 0.4 },
  { cx: 27, cy: 14, r: 0.16, opacity: 0.35 },
  { cx: 31, cy: 38, r: 0.3, opacity: 0.75 },
  { cx: 34, cy: 78, r: 0.22, opacity: 0.5 },
  { cx: 39, cy: 18, r: 0.2, opacity: 0.4 },
  { cx: 44, cy: 55, r: 0.26, opacity: 0.7 },
  { cx: 48, cy: 27, r: 0.18, opacity: 0.45 },
  { cx: 52, cy: 12, r: 0.24, opacity: 0.65 },
  { cx: 56, cy: 44, r: 0.2, opacity: 0.45 },
  { cx: 61, cy: 71, r: 0.32, opacity: 0.8 },
  { cx: 66, cy: 20, r: 0.18, opacity: 0.35 },
  { cx: 70, cy: 58, r: 0.22, opacity: 0.55 },
  { cx: 74, cy: 35, r: 0.17, opacity: 0.38 },
  { cx: 78, cy: 83, r: 0.24, opacity: 0.7 },
  { cx: 82, cy: 9, r: 0.2, opacity: 0.4 },
  { cx: 87, cy: 49, r: 0.28, opacity: 0.75 },
  { cx: 92, cy: 66, r: 0.2, opacity: 0.45 },
  { cx: 95, cy: 24, r: 0.16, opacity: 0.3 },
]

function repeatStarfield(stars: Star[], copies: number): Star[] {
  const out: Star[] = []
  for (let i = 0; i < copies; i += 1) {
    const dx = (i % 3) * 0.9
    const dy = Math.floor(i / 3) * 0.9
    for (const s of stars) {
      out.push({
        cx: (s.cx + dx * 100) % 100,
        cy: (s.cy + dy * 100) % 100,
        r: s.r * (i % 2 === 0 ? 1 : 0.85),
        opacity: s.opacity * (i % 2 === 0 ? 1 : 0.8),
      })
    }
  }
  return out
}

const STARFIELD = repeatStarfield(STARS, 6)

export function CosmicBackground({ children }: { children?: ReactNode }) {
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_30%_20%,rgba(168,85,247,0.25),transparent_60%),radial-gradient(900px_500px_at_70%_30%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(800px_500px_at_60%_80%,rgba(244,63,94,0.12),transparent_60%),linear-gradient(180deg,rgba(2,6,23,1),rgba(9,4,28,1),rgba(2,6,23,1))]" />

        <div className="absolute -left-40 top-24 h-[520px] w-[520px] rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute -right-40 top-10 h-[560px] w-[560px] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute left-1/3 top-[55%] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <svg
          className="absolute inset-0 h-full w-full opacity-70"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.35" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.9 0"
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {STARFIELD.map((s, idx) => (
            <circle
              key={idx}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="white"
              opacity={s.opacity}
              filter="url(#softGlow)"
            />
          ))}
        </svg>

        <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      {children ? <div className="relative">{children}</div> : null}
    </div>
  )
}
