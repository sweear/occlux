const ALGO     = 'AES-GCM'
const KEY_LEN  = 256
const IV_LEN   = 12

function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64urlToBuf(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    str.length + ((4 - str.length % 4) % 4), '='
  )
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: ALGO, length: KEY_LEN }, true, ['encrypt', 'decrypt'])
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key)
  return bufToB64url(raw)
}

export async function importKey(keyStr: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', b64urlToBuf(keyStr), { name: ALGO }, false, ['decrypt'])
}

export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN))
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    new TextEncoder().encode(plaintext)
  )
  const combined = new Uint8Array(IV_LEN + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), IV_LEN)
  return bufToB64url(combined.buffer)
}

export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  const combined = new Uint8Array(b64urlToBuf(encryptedData))
  const iv = combined.slice(0, IV_LEN)
  const ciphertext = combined.slice(IV_LEN)
  const plaintext = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext)
  return new TextDecoder().decode(plaintext)
}
