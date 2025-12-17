// Centralized error types and handling

export enum ErrorCode {
  // Validation errors
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_INPUT = 'INVALID_INPUT',
  SUSPICIOUS_CONTENT = 'SUSPICIOUS_CONTENT',
  
  // Storage errors
  STORAGE_FULL = 'STORAGE_FULL',
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Component errors
  COMPONENT_ERROR = 'COMPONENT_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  
  // Security errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  
  // System errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR'
}

export interface AppError {
  code: ErrorCode
  message: string
  details?: any
  timestamp: Date
  stack?: string
  userFriendly?: boolean
}

export class ValidationError extends Error {
  public readonly code = ErrorCode.INVALID_INPUT
  public readonly timestamp = new Date()
  public readonly userFriendly = true

  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class StorageError extends Error {
  public readonly timestamp = new Date()
  public readonly userFriendly = true

  constructor(
    public code: ErrorCode.STORAGE_FULL | ErrorCode.STORAGE_UNAVAILABLE | ErrorCode.DATA_CORRUPTION,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

export class SecurityError extends Error {
  public readonly timestamp = new Date()
  public readonly userFriendly = true

  constructor(
    public code: ErrorCode.RATE_LIMIT_EXCEEDED | ErrorCode.UNAUTHORIZED_ACCESS | ErrorCode.SECURITY_VIOLATION,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SecurityError'
  }
}

export class NetworkError extends Error {
  public readonly timestamp = new Date()
  public readonly userFriendly = true

  constructor(
    public code: ErrorCode.NETWORK_ERROR | ErrorCode.TIMEOUT_ERROR,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Error factory functions
export function createValidationError(message: string, details?: any): ValidationError {
  return new ValidationError(message, details)
}

export function createStorageError(
  code: ErrorCode.STORAGE_FULL | ErrorCode.STORAGE_UNAVAILABLE | ErrorCode.DATA_CORRUPTION,
  message: string,
  details?: any
): StorageError {
  return new StorageError(code, message, details)
}

export function createSecurityError(
  code: ErrorCode.RATE_LIMIT_EXCEEDED | ErrorCode.UNAUTHORIZED_ACCESS | ErrorCode.SECURITY_VIOLATION,
  message: string,
  details?: any
): SecurityError {
  return new SecurityError(code, message, details)
}

export function createNetworkError(
  code: ErrorCode.NETWORK_ERROR | ErrorCode.TIMEOUT_ERROR,
  message: string,
  details?: any
): NetworkError {
  return new NetworkError(code, message, details)
}

// Error handling utilities
export function isAppError(error: any): error is AppError {
  return error && typeof error === 'object' && 'code' in error && 'timestamp' in error
}

export function getUserFriendlyMessage(error: AppError): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.INVALID_FILE_TYPE]: 'Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG).',
    [ErrorCode.FILE_TOO_LARGE]: 'The file is too large. Please upload files smaller than 10MB.',
    [ErrorCode.INVALID_INPUT]: 'Please check your input and try again.',
    [ErrorCode.SUSPICIOUS_CONTENT]: 'Invalid content detected. Please remove any scripts or suspicious characters.',
    [ErrorCode.STORAGE_FULL]: 'Storage is full. Please delete some photos to make space.',
    [ErrorCode.STORAGE_UNAVAILABLE]: 'Storage is not available in your browser or in private mode.',
    [ErrorCode.DATA_CORRUPTION]: 'Data corruption detected. Please refresh the page.',
    [ErrorCode.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
    [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
    [ErrorCode.COMPONENT_ERROR]: 'A component error occurred. Please refresh the page.',
    [ErrorCode.RENDER_ERROR]: 'Rendering error occurred. Please refresh the page.',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
    [ErrorCode.UNAUTHORIZED_ACCESS]: 'Access denied.',
    [ErrorCode.SECURITY_VIOLATION]: 'Security violation detected.',
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    [ErrorCode.INITIALIZATION_ERROR]: 'Failed to initialize the application. Please refresh the page.'
  }

  return messages[error.code] || messages[ErrorCode.UNKNOWN_ERROR]
}

// Error logging utilities
export function logError(error: AppError, context?: string): void {
  const logData = {
    code: error.code,
    message: error.message,
    details: error.details,
    timestamp: error.timestamp,
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('App Error:', logData)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
  } else {
    // In production, you might want to send this to a logging service
    console.error('Error logged:', logData.code, logData.message)
  }
}

// Error recovery suggestions
export function getRecoverySuggestion(error: AppError): string {
  const suggestions: Record<ErrorCode, string> = {
    [ErrorCode.INVALID_FILE_TYPE]: 'Try uploading a JPEG, PNG, GIF, WebP, or SVG file.',
    [ErrorCode.FILE_TOO_LARGE]: 'Compress the image or choose a smaller file.',
    [ErrorCode.INVALID_INPUT]: 'Check for typos and ensure all fields are filled correctly.',
    [ErrorCode.SUSPICIOUS_CONTENT]: 'Remove any HTML tags, scripts, or special characters.',
    [ErrorCode.STORAGE_FULL]: 'Delete unused photos or clear browser data.',
    [ErrorCode.STORAGE_UNAVAILABLE]: 'Try using a different browser or disable private browsing.',
    [ErrorCode.DATA_CORRUPTION]: 'Refresh the page to reload the application.',
    [ErrorCode.NETWORK_ERROR]: 'Check your internet connection and try again.',
    [ErrorCode.TIMEOUT_ERROR]: 'Try again with a better internet connection.',
    [ErrorCode.COMPONENT_ERROR]: 'Refresh the page to restart the component.',
    [ErrorCode.RENDER_ERROR]: 'Try refreshing the page or clearing your browser cache.',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Wait a few moments before trying again.',
    [ErrorCode.UNAUTHORIZED_ACCESS]: 'Check your permissions and try again.',
    [ErrorCode.SECURITY_VIOLATION]: 'Refresh the page and try again.',
    [ErrorCode.UNKNOWN_ERROR]: 'Try refreshing the page or restarting your browser.',
    [ErrorCode.INITIALIZATION_ERROR]: 'Refresh the page to reinitialize the application.'
  }

  return suggestions[error.code] || 'Try refreshing the page.'
}

// Convert any error to AppError
export function normalizeError(error: any, context?: string): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof ValidationError || 
      error instanceof StorageError || 
      error instanceof SecurityError || 
      error instanceof NetworkError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
      stack: error.stack,
      userFriendly: error.userFriendly
    }
  }

  if (error instanceof Error) {
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      details: context,
      timestamp: new Date(),
      stack: error.stack,
      userFriendly: false
    }
  }

  return {
    code: ErrorCode.UNKNOWN_ERROR,
    message: String(error),
    details: context,
    timestamp: new Date(),
    userFriendly: false
  }
}
