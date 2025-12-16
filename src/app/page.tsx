import { Upload, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CosmicBackground } from '@/components/cosmic-background'
import { UploadFlow } from '@/components/upload-flow'
import { ProgressBar } from '@/components/progress-bar'
import dynamic from 'next/dynamic'

const InductionMindMovieCanvas = dynamic(() => import('@/components/induction-mindmovie-canvas').then(mod => ({ default: mod.InductionMindMovieCanvas })), {
  ssr: false,
  loading: () => (
    <div className="aspect-video rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
      <div className="text-sm text-white/60">Loading canvas...</div>
    </div>
  )
})

export default function Home() {
  return (
    <CosmicBackground>
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-16">
          <header className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300/80 shadow-[0_0_18px_rgba(217,70,239,0.55)]" />
              Create and mint your own mind movie with <span className="font-semibold text-white">MindMint</span>
            </div>

            <nav className="hidden items-center gap-5 text-sm text-white md:flex">
              <Link href="/upload" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0">
                Upload
              </Link>
              <Link href="/create" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0">
                Create
              </Link>
              <Link href="/gallery" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0">
                Gallery
              </Link>
            </nav>
          </header>

          <section className="mt-12 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                Create and mint your own
                <span className="block bg-gradient-to-r from-fuchsia-200 via-sky-200 to-violet-200 bg-clip-text text-transparent">
                  mind movie.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white sm:text-lg">
                Upload photos from your past, present, and future, then step into the studio to shape a mind-movie.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#upload"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_18px_60px_rgba(56,189,248,0.15)] transition hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0"
                >
                  <Upload className="h-4 w-4" />
                  Start uploading
                </Link>
                <Link
                  href="#canvas"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/60 focus-visible:ring-offset-0"
                >
                  <Sparkles className="h-4 w-4" />
                  Open the canvas
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-xs text-white">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">No account needed to explore</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">Max 10MB per image</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">Past • Present • Future</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-fuchsia-500/20 via-sky-500/10 to-violet-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="text-sm font-medium text-white">Your mind-movie flow</div>
                    <div className="mt-1 text-xs text-white">Upload + canvas, right here on the homepage.</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    href="#upload"
                    className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/85">
                          <Upload className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Upload photos</div>
                          <div className="mt-0.5 text-xs text-white">Drag & drop your images</div>
                        </div>
                      </div>
                      <span className="text-xs text-white transition group-hover:text-white">→</span>
                    </div>
                  </Link>

                  <Link
                    href="#canvas"
                    className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/60 focus-visible:ring-offset-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/85">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Create on the canvas</div>
                          <div className="mt-0.5 text-xs text-white">Compose your kaleidoscope mind-movie</div>
                        </div>
                      </div>
                      <span className="text-xs text-white transition group-hover:text-white">→</span>
                    </div>
                  </Link>

                  <Link
                    href="/gallery"
                    className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60 focus-visible:ring-offset-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/85">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Gallery</div>
                          <div className="mt-0.5 text-xs text-white">Revisit and share your creations</div>
                        </div>
                      </div>
                      <span className="text-xs text-white transition group-hover:text-white">→</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Your Journey</h2>
              <p className="mt-2 text-sm text-white">Upload, organize, and create your mind-movie</p>
            </div>
            <ProgressBar 
              steps={[
                { id: 'upload', label: 'Upload Photos', status: 'active' },
                { id: 'organize', label: 'Organize by Time', status: 'pending' },
                { id: 'create', label: 'Create Movie', status: 'pending' }
              ]}
              currentStep="upload"
            />
          </section>

          <section id="upload" className="mt-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Upload your photos</h2>
              <p className="mt-2 text-sm text-white">Drag & drop images or click to select from your device</p>
            </div>
            <div className="mt-6">
              <UploadFlow compact={true} />
            </div>
          </section>

          <section id="canvas" className="mt-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Create your mind-movie</h2>
              <p className="mt-2 text-sm text-white">Compose your kaleidoscope mind-movie with affirmations and healing frequencies</p>
            </div>
            <div className="mt-6">
              <InductionMindMovieCanvas />
            </div>
          </section>

          <footer className="mt-14 border-t border-white/10 pt-6 text-xs text-white/45">
            MindMint is a quiet little cosmos for your past, present, and future.
          </footer>
        </div>
      </main>
    </CosmicBackground>
  );
}
