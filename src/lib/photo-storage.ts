import { validateTextInput, sanitizeTextInput } from './validation'

export type PhotoCategory = 'dreams' | 'vision' | 'manifestation'

export type StoredPhoto = {
  id: string
  url: string
  category: PhotoCategory
  name: string
  size: number
  uploadedAt: string
}

const STORAGE_KEY = 'mindmint-photos'
const MAX_STORAGE_SIZE = 50 * 1024 * 1024 // 50MB limit

// Safe localStorage operations with error handling
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

function getStorageSize(): number {
  if (!isLocalStorageAvailable()) return 0
  
  try {
    let totalSize = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
      }
    }
    return totalSize
  } catch {
    return 0
  }
}

function validatePhotoData(photo: Partial<StoredPhoto>): ValidationResult {
  if (!photo.id || typeof photo.id !== 'string') {
    return { isValid: false, error: 'Invalid photo ID' }
  }
  
  if (!photo.url || typeof photo.url !== 'string') {
    return { isValid: false, error: 'Invalid photo URL' }
  }
  
  if (!photo.category || !['dreams', 'vision', 'manifestation'].includes(photo.category)) {
    return { isValid: false, error: 'Invalid photo category' }
  }
  
  if (!photo.name || typeof photo.name !== 'string') {
    return { isValid: false, error: 'Invalid photo name' }
  }
  
  if (typeof photo.size !== 'number' || photo.size < 0) {
    return { isValid: false, error: 'Invalid photo size' }
  }
  
  // Validate and sanitize name
  const nameValidation = validateTextInput(photo.name, 255)
  if (!nameValidation.isValid) {
    return nameValidation
  }
  
  return { isValid: true }
}

interface ValidationResult {
  isValid: boolean
  error?: string
}

export function getStoredPhotos(): StoredPhoto[] {
  if (!isLocalStorageAvailable()) return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    
    // Validate structure
    if (!Array.isArray(parsed)) {
      console.warn('Invalid photo data structure in localStorage')
      return []
    }
    
    // Validate each photo
    const validPhotos = parsed.filter(photo => {
      const validation = validatePhotoData(photo)
      if (!validation.isValid) {
        console.warn('Invalid photo data:', validation.error, photo)
        return false
      }
      return true
    })
    
    // Update storage with cleaned data
    if (validPhotos.length !== parsed.length) {
      storePhotos(validPhotos)
    }
    
    return validPhotos
  } catch (error) {
    console.error('Failed to read photos from localStorage:', error)
    return []
  }
}

export function storePhotos(photos: StoredPhoto[]): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available')
    return false
  }
  
  try {
    // Check storage size limit
    const dataSize = JSON.stringify(photos).length * 2 // Rough estimate
    const currentSize = getStorageSize()
    
    if (currentSize + dataSize > MAX_STORAGE_SIZE) {
      console.warn('Storage size limit exceeded')
      return false
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos))
    return true
  } catch (error) {
    console.error('Failed to store photos:', error)
    
    // Try to clear some space and retry
    try {
      const photos = getStoredPhotos()
      const trimmedPhotos = photos.slice(0, Math.floor(photos.length * 0.8))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedPhotos))
      return true
    } catch (retryError) {
      console.error('Failed to store photos even after cleanup:', retryError)
      return false
    }
  }
}

export function addPhoto(photo: Omit<StoredPhoto, 'uploadedAt'>): StoredPhoto | null {
  // Validate input
  const validation = validatePhotoData(photo)
  if (!validation.isValid) {
    console.error('Invalid photo data:', validation.error)
    return null
  }
  
  const photos = getStoredPhotos()
  const newPhoto: StoredPhoto = {
    ...photo,
    name: sanitizeTextInput(photo.name),
    uploadedAt: new Date().toISOString()
  }
  
  // Check for duplicates
  if (photos.some(p => p.id === newPhoto.id)) {
    console.warn('Photo with this ID already exists')
    return null
  }
  
  photos.push(newPhoto)
  
  if (storePhotos(photos)) {
    return newPhoto
  } else {
    console.error('Failed to store new photo')
    return null
  }
}

export function updatePhotoCategory(id: string, category: PhotoCategory): boolean {
  if (!id || typeof id !== 'string') {
    console.error('Invalid photo ID')
    return false
  }
  
  if (!['dreams', 'vision', 'manifestation'].includes(category)) {
    console.error('Invalid category')
    return false
  }
  
  const photos = getStoredPhotos()
  const updated = photos.map(p => 
    p.id === id ? { ...p, category } : p
  )
  
  return storePhotos(updated)
}

export function removePhoto(id: string): boolean {
  if (!id || typeof id !== 'string') {
    console.error('Invalid photo ID')
    return false
  }
  
  const photos = getStoredPhotos()
  const filtered = photos.filter(p => p.id !== id)
  
  if (filtered.length === photos.length) {
    console.warn('Photo not found for removal')
    return false
  }
  
  return storePhotos(filtered)
}

export function getPhotosByCategory(): Record<PhotoCategory, StoredPhoto[]> {
  const photos = getStoredPhotos()
  return {
    dreams: photos.filter(p => p.category === 'dreams'),
    vision: photos.filter(p => p.category === 'vision'),
    manifestation: photos.filter(p => p.category === 'manifestation')
  }
}

export function hasPhotosInAllCategories(): boolean {
  const photosByCategory = getPhotosByCategory()
  return Object.values(photosByCategory).every(photos => photos.length > 0)
}

export function getChronologicalPhotos(): StoredPhoto[] {
  const photosByCategory = getPhotosByCategory()
  return [...photosByCategory.dreams, ...photosByCategory.vision, ...photosByCategory.manifestation]
}

// Utility to clear all photo data
export function clearAllPhotos(): boolean {
  if (!isLocalStorageAvailable()) return false
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear photos:', error)
    return false
  }
}

// Get storage usage statistics
export function getStorageStats(): { used: number; available: number; percentage: number } {
  const used = getStorageSize()
  const available = MAX_STORAGE_SIZE - used
  const percentage = (used / MAX_STORAGE_SIZE) * 100
  
  return { used, available, percentage }
}
