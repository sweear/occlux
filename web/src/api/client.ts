const BASE = '/api/v1'

export interface CreateSecretRequest {
  encryptedData: string
  maxViews: number
  ttlMinutes: number
}

export interface CreateSecretResponse {
  success: boolean
  id: string
  expiresAt: string
}

export interface GetSecretResponse {
  success: boolean
  encryptedData: string
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function createSecret(body: CreateSecretRequest): Promise<CreateSecretResponse> {
  return request<CreateSecretResponse>('/secrets', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getSecret(id: string): Promise<GetSecretResponse> {
  return request<GetSecretResponse>(`/secrets/${id}`)
}
