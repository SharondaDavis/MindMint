'use client'

import { ArrowRight, Sparkles, Wand2, RefreshCw, HeartHandshake } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'
import { setReferralVisit } from '@/lib/referral'

export default function LandingPage() {
  const demoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    trackEvent('landing_view')
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferralVisit(ref)
      trackEvent('referral_visit', { ref })
    }
  }, [])

  useEffect(() => {
    if (!demoRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackEvent('demo_view')
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(demoRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <main className="min-h-screen bg-[#090611] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-20">
        <header className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300/80 shadow-[0_0_18px_rgba(217,70,239,0.55)]" />
            MindMint • Base Mini App
          </div>
          <div className="hidden text-xs text-white/60 md:flex">Minting coming soon</div>
        </header>

        <section className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Your 60-second daily aura reset.
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base text-white/70 sm:text-lg">
              Breathe, spin, and get guidance + an affirmation. One minute. Every day.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                onClick={() => trackEvent('cta_start_free_click')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/95"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/60">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">No account needed</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Daily streaks</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Shareable aura cards</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-fuchsia-500/20 via-indigo-500/20 to-cyan-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#16062f] via-[#1d0f57] to-[#0b1028] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/60">Daily aura flow</div>
              <div className="mt-4 text-3xl font-semibold">Breathe → Spin → Receive</div>
              <p className="mt-2 text-sm text-white/70">
                A gentle one‑minute reset designed for consistent, daily momentum.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-24 w-24 rounded-full border border-white/20 bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-full rounded-full bg-white/10" />
                  <div className="h-2 w-4/5 rounded-full bg-white/10" />
                  <div className="h-2 w-3/5 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 border-y border-white/10 py-6 text-xs uppercase tracking-[0.3em] text-white/50">
          Featured in · Built for Base · Loved by builders
        </section>

        <section id="demo" ref={demoRef} className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold">See the flow in action</h2>
            <p className="mt-2 text-sm text-white/70">
              A lightweight demo of the core flow. Breathe, spin, receive.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4" />
                1‑minute reset to set your tone.
              </div>
              <div className="flex items-center gap-3">
                <Wand2 className="h-4 w-4" />
                Aura guidance + affirmation.
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4" />
                Practice spins whenever you want.
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-cyan-400/20 via-indigo-400/20 to-fuchsia-400/20 blur-2xl" />
            <div className="relative h-72 rounded-3xl border border-white/10 bg-black/40 p-6">
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/70">
                <div className="h-28 w-28 rounded-full border border-white/20 bg-gradient-to-br from-fuchsia-400/30 via-cyan-400/20 to-indigo-400/30" />
                <div className="text-xs uppercase tracking-[0.3em]">Breathe</div>
                <div className="text-xs uppercase tracking-[0.3em]">Spin</div>
                <div className="text-xs uppercase tracking-[0.3em]">Receive</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            { title: 'Breathe', copy: 'One calm minute to reset your nervous system.' },
            { title: 'Spin', copy: 'Reveal your daily aura in a single pull.' },
            { title: 'Receive', copy: 'Guidance + affirmation to carry forward.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-lg font-semibold">{item.title}</div>
              <p className="mt-2 text-sm text-white/70">{item.copy}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            { quote: '“The fastest calm reset I’ve found this week.”', name: 'Builder A' },
            { quote: '“Simple, beautiful, and I actually come back.”', name: 'Builder B' },
            { quote: '“Feels like a tiny morning reset without the effort.”', name: 'Builder C' },
          ].map((item) => (
            <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/80">{item.quote}</p>
              <p className="mt-3 text-xs text-white/50">{item.name}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {[
              { icon: Sparkles, title: 'Start', copy: 'Open the app and take a deep breath.' },
              { icon: Wand2, title: 'Spin', copy: 'Spin the wheel to reveal today’s aura.' },
              { icon: HeartHandshake, title: 'Receive', copy: 'Save or share your aura card.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <item.icon className="h-5 w-5" />
                <div className="mt-4 text-lg font-semibold">{item.title}</div>
                <p className="mt-2 text-sm text-white/70">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-6 space-y-3">
            {[
              {
                q: 'Is MindMint free?',
                a: 'Yes. The daily aura flow is free. Minting is coming soon.',
              },
              {
                q: 'How long does it take?',
                a: 'About 60 seconds for the core flow.',
              },
              {
                q: 'Do I need a wallet?',
                a: 'No. A wallet is optional and only needed for future minting.',
              },
              {
                q: 'Can I spin more than once?',
                a: 'Yes. Practice spins are always available.',
              },
              {
                q: 'Is my data private?',
                a: 'Affirmations and prompts are saved locally on your device.',
              },
            ].map((item) => (
              <details key={item.q} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-white/80">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm text-white/60">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-white/10 bg-black/70 p-4 text-white shadow-lg backdrop-blur sm:hidden">
        <Link
          href="/app"
          onClick={() => trackEvent('cta_start_free_click')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
        >
          Start free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  )
}
