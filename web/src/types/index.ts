export const VALIDATION = {
  SECRET_MAX_CHARS: 5000,
  TTL_MIN_MINUTES: 1,
  TTL_MAX_MINUTES: 4320,
} as const

export type Lang = 'en' | 'ru'

export type CreateStatus = 'idle' | 'encrypting' | 'uploading' | 'success' | 'error'
export interface CreateState {
  status: CreateStatus
  shareUrl?: string
  shortUrl?: string
  keyStr?: string
  error?: string
}

export type ViewStatus = 'idle' | 'loading' | 'decrypting' | 'success' | 'not_found' | 'error'
export interface ViewState {
  status: ViewStatus
  plaintext?: string
  error?: string
}
