/**
 * hooks/useCreateSecret.ts
 *
 * Генерирует ДВЕ ссылки после создания секрета:
 *
 *  fullUrl   — /s/{id}#{key}
 *    Ключ в # фрагменте. Переходишь → нажимаешь "Раскрыть" → сразу видишь.
 *    Фрагмент (#) никогда не уходит на сервер.
 *
 *  shortUrl  — /s/{id}  (без ключа)
 *    Переходишь → нажимаешь → просит ввести ключ вручную.
 *    Ключ передаётся отдельным каналом.
 *
 *  decryptKey — сам ключ расшифровки (строка) для отдельной копии.
 *
 * Ключ расшифровки — это НЕ пароль. Это строка из которой через
 * PBKDF2 выводится AES ключ. Если пользователь ввёл свой — используем его.
 * Если пустой — генерируем случайный.
 */

import { useState, useCallback } from 'react'
import * as api from '@/api/client'
import type { CreateState } from '@/types'

// ─── Crypto через Web Crypto API ─────────────────────────────────

const ALGO    = 'AES-GCM'
const IV_LEN  = 12
const SALT_LEN = 16
const PBKDF2_IT = 100_000

function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64urlToBuf(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - str.length % 4) % 4), '=')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

/**
 * Выводит AES-GCM ключ из строки-пароля через PBKDF2.
 * Ключ расшифровки — это именно эта строка.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const pwKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_IT, hash: 'SHA-256' },
    pwKey,
    { name: ALGO, length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Шифрует текст ключом расшифровки.
 * Результат: base64url( salt[16] | iv[12] | ciphertext )
 * Соль и IV хранятся вместе с шифртекстом.
 */
export async function encryptWithKey(plaintext: string, decryptKey: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN))
  const iv   = crypto.getRandomValues(new Uint8Array(IV_LEN))
  const aesKey = await deriveKey(decryptKey, salt)

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    aesKey,
    new TextEncoder().encode(plaintext)
  )

  const combined = new Uint8Array(SALT_LEN + IV_LEN + ciphertext.byteLength)
  combined.set(salt, 0)
  combined.set(iv, SALT_LEN)
  combined.set(new Uint8Array(ciphertext), SALT_LEN + IV_LEN)
  return bufToB64url(combined.buffer)
}

/**
 * Расшифровывает данные ключом расшифровки.
 * Ожидает формат из encryptWithKey().
 */
export async function decryptWithKey(encryptedData: string, decryptKey: string): Promise<string> {
  const combined = new Uint8Array(b64urlToBuf(encryptedData))
  const salt      = combined.slice(0, SALT_LEN)
  const iv        = combined.slice(SALT_LEN, SALT_LEN + IV_LEN)
  const ciphertext = combined.slice(SALT_LEN + IV_LEN)

  const aesKey = await deriveKey(decryptKey, salt)
  const plaintext = await crypto.subtle.decrypt({ name: ALGO, iv }, aesKey, ciphertext)
  return new TextDecoder().decode(plaintext)
}

export function generateDecryptKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const arr = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(arr).map(b => chars[b % chars.length]).join('')
}

// ─── Хук ─────────────────────────────────────────────────────────

interface CreateOptions {
  text: string
  ttlMinutes: number
  maxViews: number
  decryptKey: string   // уже финальный ключ (сгенерирован или введён пользователем)
}

export function useCreateSecret() {
  const [state, setState] = useState<CreateState>({ status: 'idle' })

  const createSecret = useCallback(async ({ text, ttlMinutes, maxViews, decryptKey }: CreateOptions) => {
    setState({ status: 'encrypting' })

    try {
      // Шифруем текст ключом расшифровки
      const encryptedData = await encryptWithKey(text, decryptKey)

      setState({ status: 'uploading' })
      const response = await api.createSecret({ encryptedData, ttlMinutes, maxViews })

      const base = `${window.location.origin}/s/${response.id}`

      setState({
        status: 'success',
        // Полная ссылка — ключ в # фрагменте
        shareUrl: `${base}#${encodeURIComponent(decryptKey)}`,
        // Короткая ссылка — без ключа
        shortUrl: base,
        // Сам ключ для отдельной передачи
        decryptKey,
      })
    } catch (err) {
      setState({ status: 'error', error: err instanceof Error ? err.message : 'Unexpected error' })
    }
  }, [])

  const reset = useCallback(() => setState({ status: 'idle' }), [])
  return { state, createSecret, reset }
}
