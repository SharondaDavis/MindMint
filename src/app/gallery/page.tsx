import Link from 'next/link'
import { ArrowLeft, Images } from 'lucide-react'

export default function GalleryPage() {
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
              <Images className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
              <p className="mt-1 text-sm text-muted-foreground">Saved mind-movies and sessions will live here.</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
            Next step: persist sessions in storage (e.g., S3/R2) and list them here.
          </div>
        </div>
      </div>
    </main>
  )
}
