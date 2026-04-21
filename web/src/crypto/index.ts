/**
 * crypto/index.ts
 *
 * Всё шифрование — в браузере через Web Crypto API (AES-256-GCM).
 * Сервер никогда не видит plaintext и не видит ключ.
 *
 * ─── Флоу создания ───────────────────────────────────────────────
 *  1. generateKey()          → случайный 256-бит AES ключ
 *  2. encrypt(text, key)     → base64url(iv[12] + ciphertext)
 *  3. Если пароль:
 *     encryptKeyWithPassword(key, password)
 *       → { encryptedKey, salt }  (хранится на сервере рядом с данными)
 *  4. POST /api/v1/secrets   → { data, ttl, password_protected? }
 *  5. exportKey(key)         → base64url строка → кладём в URL#fragment
 *     Итог: /s/{id}#{keyBase64url}
 *
 * ─── Флоу чтения ─────────────────────────────────────────────────
 *  1. Из window.location.hash.slice(1) достаём keyBase64url
 *  2. GET /api/v1/secrets/:id → { data, password_protected? }
 *  3. Если есть password_protected:
 *     decryptKeyWithPassword(encryptedKey, salt, password) → mainKey
 *     Иначе: importKey(keyBase64url) → mainKey
 *  4. decrypt(data, mainKey) → plaintext
 */

const ALGO       = 'AES-GCM'
const KEY_LEN    = 256   // бит
const IV_LEN     = 12    // байт (NIST рекомендация для AES-GCM)
const SALT_LEN   = 16    // байт (для PBKDF2)
const PBKDF2_IT  = 100_000

// ─── Кодирование ─────────────────────────────────────────────────

/** ArrayBuffer → base64url (URL-safe, без паддинга =) */
export function bufferToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/** base64url → ArrayBuffer */
export function base64urlToBuffer(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    str.length + ((4 - (str.length % 4)) % 4), '='
  )
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

// ─── Ключ ─────────────────────────────────────────────────────────

/** Генерирует новый случайный AES-GCM ключ */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: ALGO, length: KEY_LEN }, true, ['encrypt', 'decrypt'])
}

/** CryptoKey → base64url строка (для URL фрагмента) */
export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key)
  return bufferToBase64url(raw)
}

/** base64url строка → CryptoKey (импорт из URL фрагмента) */
export async function importKey(keyStr: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', base64urlToBuffer(keyStr), { name: ALGO }, false, ['decrypt'])
}

// ─── Шифрование / расшифровка ─────────────────────────────────────

/**
 * Шифрует строку.
 * Формат результата: base64url( iv[12 байт] | ciphertext )
 * IV хранится вместе с шифртекстом — стандартная практика AES-GCM.
 */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded)

  const combined = new Uint8Array(IV_LEN + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), IV_LEN)
  return bufferToBase64url(combined.buffer)
}

/**
 * Расшифровывает данные.
 * Ожидает base64url( iv[12 байт] | ciphertext ) — формат из encrypt().
 * Бросает ошибку при неверном ключе (AES-GCM аутентифицированное шифрование).
 */
export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  const combined = new Uint8Array(base64urlToBuffer(encryptedData))
  const iv = combined.slice(0, IV_LEN)
  const ciphertext = combined.slice(IV_LEN)

  const plaintext = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext)
  return new TextDecoder().decode(plaintext)
}

// ─── Защита паролем (PBKDF2 + AES) ───────────────────────────────

/**
 * Выводит AES ключ из пароля через PBKDF2-SHA256.
 * Используется чтобы зашифровать ОСНОВНОЙ ключ — не сам текст.
 * Это позволит в будущем менять пароль без перешифровки данных.
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const pwKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_IT, hash: 'SHA-256' },
    pwKey,
    { name: ALGO, length: KEY_LEN },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Шифрует основной ключ паролем пользователя.
 * Результат хранится на сервере вместе с зашифрованными данными.
 */
export async function encryptKeyWithPassword(
  mainKey: CryptoKey,
  password: string
): Promise<{ encryptedKey: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN))
  const pwKey = await deriveKeyFromPassword(password, salt)

  const rawKey = await crypto.subtle.exportKey('raw', mainKey)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN))
  const encrypted = await crypto.subtle.encrypt({ name: ALGO, iv }, pwKey, rawKey)

  const combined = new Uint8Array(IV_LEN + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), IV_LEN)

  return {
    encryptedKey: bufferToBase64url(combined.buffer),
    salt: bufferToBase64url(salt.buffer),
  }
}

/**
 * Расшифровывает основной ключ паролем пользователя.
 * Бросает ошибку если пароль неверный.
 */
export async function decryptKeyWithPassword(
  encryptedKey: string,
  salt: string,
  password: string
): Promise<CryptoKey> {
  const saltBytes = new Uint8Array(base64urlToBuffer(salt))
  const pwKey = await deriveKeyFromPassword(password, saltBytes)

  const combined = new Uint8Array(base64urlToBuffer(encryptedKey))
  const iv = combined.slice(0, IV_LEN)
  const ciphertext = combined.slice(IV_LEN)

  const rawKey = await crypto.subtle.decrypt({ name: ALGO, iv }, pwKey, ciphertext)
  return crypto.subtle.importKey('raw', rawKey, { name: ALGO }, false, ['decrypt'])
}
