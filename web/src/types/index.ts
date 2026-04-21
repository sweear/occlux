export interface TtlOption { label: string; labelRu: string; minutes: number }

export const TTL_OPTIONS: TtlOption[] = [
  { label: '1m',  labelRu: '1м',  minutes: 1   },
  { label: '5m',  labelRu: '5м',  minutes: 5   },
  { label: '10m', labelRu: '10м', minutes: 10  },
  { label: '30m', labelRu: '30м', minutes: 30  },
  { label: '1h',  labelRu: '1ч',  minutes: 60  },
  { label: '6h',  labelRu: '6ч',  minutes: 360 },
  { label: '1d',  labelRu: '1д',  minutes: 1440},
  { label: '3d',  labelRu: '3д',  minutes: 4320},
]

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
  decryptKey?: string
  error?: string
}

export type ViewStatus = 'idle' | 'loading' | 'needs_key' | 'decrypting' | 'success' | 'not_found' | 'error'
export interface ViewState {
  status: ViewStatus
  plaintext?: string
  viewsRemaining?: number  // если бэкенд вернёт — покажем
  error?: string
  passwordError?: string
}
