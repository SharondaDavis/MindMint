// File upload validation and sanitization

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface FileValidationOptions {
  maxSizeBytes: number
  allowedTypes: string[]
  maxFiles?: number
}

const DEFAULT_OPTIONS: FileValidationOptions = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  maxFiles: 50
}

export function validateFile(file: File, options: Partial<FileValidationOptions> = {}): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Check file size
  if (file.size > opts.maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds maximum of ${formatBytes(opts.maxSizeBytes)}`
    }
  }

  // Check file type
  if (!opts.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    }
  }

  // Check file name for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /[<>:"|?*]/,  // Invalid characters
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,  // Reserved names
    /\.exe$/i,  // Executable files
    /\.bat$/i,  // Batch files
    /\.cmd$/i,  // Command files
    /\.scr$/i,  // Screen saver files
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        isValid: false,
        error: 'File name contains invalid characters or patterns'
      }
    }
  }

  return { isValid: true }
}

export function validateFiles(files: FileList | File[], options: Partial<FileValidationOptions> = {}): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const fileArray = Array.from(files)

  // Check number of files
  if (opts.maxFiles && fileArray.length > opts.maxFiles) {
    return {
      isValid: false,
      error: `Maximum ${opts.maxFiles} files allowed`
    }
  }

  // Validate each file
  for (const file of fileArray) {
    const result = validateFile(file, options)
    if (!result.isValid) {
      return result
    }
  }

  return { isValid: true }
}

export function sanitizeFileName(fileName: string): string {
  // Remove or replace dangerous characters
  return fileName
    .replace(/[<>:"|?*]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\./, '_')
    .slice(0, 255) // Limit length
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Content validation for text inputs
export function validateTextInput(input: string, maxLength: number = 10000): ValidationResult {
  if (typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Input must be a string'
    }
  }

  if (input.length > maxLength) {
    return {
      isValid: false,
      error: `Input exceeds maximum length of ${maxLength} characters`
    }
  }

  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // Script tags
    /javascript:/gi,  // JavaScript protocol
    /on\w+\s*=/gi,  // Event handlers
    /data:text\/html/gi,  // Data URLs
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        error: 'Input contains potentially dangerous content'
      }
    }
  }

  return { isValid: true }
}

export function sanitizeTextInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}
