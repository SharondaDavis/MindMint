// Security utilities and rate limiting

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private static instance: RateLimiter
  private limits: Map<string, RateLimitEntry> = new Map()
  private readonly defaultWindowMs = 60000 // 1 minute
  private readonly defaultMaxRequests = 100

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  isAllowed(
    identifier: string, 
    maxRequests?: number, 
    windowMs?: number
  ): boolean {
    const now = Date.now()
    const max = maxRequests || this.defaultMaxRequests
    const window = windowMs || this.defaultWindowMs

    const entry = this.limits.get(identifier)
    
    if (!entry || now > entry.resetTime) {
      // New window or expired entry
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + window
      })
      return true
    }

    if (entry.count >= max) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingRequests(
    identifier: string,
    maxRequests?: number
  ): number {
    const entry = this.limits.get(identifier)
    const max = maxRequests || this.defaultMaxRequests
    
    if (!entry || Date.now() > entry.resetTime) {
      return max
    }

    return Math.max(0, max - entry.count)
  }

  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier)
    return entry ? entry.resetTime : 0
  }

  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.limits.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      this.limits.delete(key)
    })
  }
}

// Content Security Policy
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// Input sanitization for user-generated content
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Generate secure random IDs
export function generateSecureId(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Validate URLs to prevent XSS
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'data:', 'blob:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Check for suspicious patterns in user input
export function containsSuspiciousContent(input: string): boolean {
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /file:/gi,
    /ftp:/gi
  ]

  return suspiciousPatterns.some(pattern => pattern.test(input))
}

// Rate limiting utilities
export const rateLimiter = RateLimiter.getInstance()

// Cleanup old rate limit entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup()
  }, 60000) // Cleanup every minute
}

// Safe JSON parsing with error handling
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

// Safe JSON stringifying with size limits
export function safeJsonStringify(obj: any, maxSize: number = 1024 * 1024): string | null {
  try {
    const json = JSON.stringify(obj)
    if (json.length > maxSize) {
      console.warn('JSON string exceeds maximum size limit')
      return null
    }
    return json
  } catch (error) {
    console.error('Failed to stringify object:', error)
    return null
  }
}

// Validate and sanitize user responses for legacy questions
export function validateLegacyResponse(response: string): ValidationResult {
  if (typeof response !== 'string') {
    return { isValid: false, error: 'Response must be a string' }
  }

  if (response.length > 5000) {
    return { isValid: false, error: 'Response is too long (max 5000 characters)' }
  }

  if (response.length < 10) {
    return { isValid: false, error: 'Response is too short (min 10 characters)' }
  }

  if (containsSuspiciousContent(response)) {
    return { isValid: false, error: 'Response contains suspicious content' }
  }

  return { isValid: true }
}

interface ValidationResult {
  isValid: boolean
  error?: string
}

// Secure storage key generation
export function generateStorageKey(prefix: string, userId?: string): string {
  const timestamp = Date.now().toString(36)
  const random = generateSecureId().substring(0, 8)
  const user = userId || 'anonymous'
  return `${prefix}_${user}_${timestamp}_${random}`
}

// Check if browser supports required security features
export function checkSecuritySupport(): {
  crypto: boolean
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean
} {
  return {
    crypto: typeof window !== 'undefined' && 'crypto' in window && 'getRandomValues' in window.crypto,
    localStorage: typeof window !== 'undefined' && 'localStorage' in window,
    sessionStorage: typeof window !== 'undefined' && 'sessionStorage' in window,
    indexedDB: typeof window !== 'undefined' && 'indexedDB' in window
  }
}
