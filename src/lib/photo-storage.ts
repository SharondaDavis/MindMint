export type PhotoCategory = 'past' | 'present' | 'future'

export type StoredPhoto = {
  id: string
  url: string
  category: PhotoCategory
  name: string
  size: number
  uploadedAt: string
}

const STORAGE_KEY = 'mindmint-photos'

export function getStoredPhotos(): StoredPhoto[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function storePhotos(photos: StoredPhoto[]) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos))
  } catch (error) {
    console.error('Failed to store photos:', error)
  }
}

export function addPhoto(photo: Omit<StoredPhoto, 'uploadedAt'>) {
  const photos = getStoredPhotos()
  const newPhoto: StoredPhoto = {
    ...photo,
    uploadedAt: new Date().toISOString()
  }
  photos.push(newPhoto)
  storePhotos(photos)
  return newPhoto
}

export function updatePhotoCategory(id: string, category: PhotoCategory) {
  const photos = getStoredPhotos()
  const updated = photos.map(p => p.id === id ? { ...p, category } : p)
  storePhotos(updated)
}

export function removePhoto(id: string) {
  const photos = getStoredPhotos()
  const filtered = photos.filter(p => p.id !== id)
  storePhotos(filtered)
}

export function getPhotosByCategory(): Record<PhotoCategory, StoredPhoto[]> {
  const photos = getStoredPhotos()
  return {
    past: photos.filter(p => p.category === 'past'),
    present: photos.filter(p => p.category === 'present'),
    future: photos.filter(p => p.category === 'future')
  }
}

export function hasPhotosInAllCategories(): boolean {
  const photosByCategory = getPhotosByCategory()
  return Object.values(photosByCategory).every(photos => photos.length > 0)
}

export function getChronologicalPhotos(): StoredPhoto[] {
  const photosByCategory = getPhotosByCategory()
  return [...photosByCategory.past, ...photosByCategory.present, ...photosByCategory.future]
}
