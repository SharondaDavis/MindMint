import { NextResponse } from 'next/server'

type UploadItem = {
  name: string
  type: string
  size: number
  category: 'past' | 'present' | 'future'
}

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_CATEGORIES = new Set(['past', 'present', 'future'])

export async function POST(req: Request) {
  try {
    const form = await req.formData()

    const files = form.getAll('photos').filter((v): v is File => v instanceof File)
    const categoriesRaw = form.getAll('categories').map((v) => (typeof v === 'string' ? v : 'present'))

    if (files.length === 0) {
      return NextResponse.json({ ok: false, message: 'No files received. Use form field "photos".' }, { status: 400 })
    }

    const items: UploadItem[] = []

    for (let i = 0; i < files.length; i += 1) {
      const f = files[i]
      const categoryRaw = categoriesRaw[i] ?? 'present'
      const category = (ALLOWED_CATEGORIES.has(categoryRaw) ? categoryRaw : 'present') as UploadItem['category']

      if (!f.type.startsWith('image/')) {
        return NextResponse.json({ ok: false, message: `Unsupported file type for ${f.name}` }, { status: 415 })
      }

      if (f.size > MAX_FILE_BYTES) {
        return NextResponse.json({ ok: false, message: `${f.name} exceeds 10MB limit.` }, { status: 413 })
      }

      // NOTE: On Vercel/Base serverless, you typically stream to object storage here.
      // For the foundation, we validate and return metadata.
      items.push({ name: f.name, type: f.type, size: f.size, category })
    }

    return NextResponse.json({ ok: true, count: items.length, items })
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : 'Upload failed.' },
      { status: 500 }
    )
  }
}
