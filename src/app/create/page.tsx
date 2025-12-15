import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-border bg-background p-3">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Create</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This is the placeholder for the mind-movie generator (kaleidoscope canvas + audio).
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
            Next step: wire this page to your uploaded assets and render the kaleidoscope effect on a canvas.
          </div>
        </div>
      </div>
    </main>
  )
}
