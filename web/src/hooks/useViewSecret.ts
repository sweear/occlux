/**
 * hooks/useViewSecret.ts
 *
 * Два сценария в зависимости от наличия # фрагмента в URL:
 *
 *  1. Есть фрагмент (#key) — полная ссылка
 *     loadSecret() → сразу расшифровывает → success
 *
 *  2. Нет фрагмента — короткая ссылка
 *     loadSecret() → needs_key (просит ввести ключ)
 *     unlockWithKey(key) → расшифровывает → success
 *
 * GET запрос идёт при первом нажатии кнопки "Раскрыть".
 * После GET сервер удаляет секрет — это необратимо.
 */

import { useState, useCallback, useRef } from 'react'
import { decryptWithKey } from './useCreateSecret'
import * as api from '@/api/client'
import type { ViewState } from '@/types'

export function useViewSecret(id: string) {
  const [state, setState] = useState<ViewState>({ status: 'idle' })

  // Кешируем зашифрованные данные между шагами
  const cachedData = useRef<string | null>(null)

  const loadSecret = useCallback(async () => {
    setState({ status: 'loading' })

    try {
      const response = await api.getSecret(id)
      cachedData.current = response.encryptedData

      // Есть # фрагмент — полная ссылка, расшифровываем сразу
      const fragment = window.location.hash.slice(1)
      if (fragment) {
        setState({ status: 'decrypting' })
        const key = decodeURIComponent(fragment)
        const plaintext = await decryptWithKey(response.encryptedData, key)
        setState({ status: 'success', plaintext })
        return
      }

      // Нет фрагмента — короткая ссылка, просим ключ
      setState({ status: 'needs_key' })

    } catch (err) {
      if (err instanceof api.ApiError && err.status === 404) {
        setState({ status: 'not_found' })
      } else {
        setState({ status: 'error', error: err instanceof Error ? err.message : 'Failed' })
      }
    }
  }, [id])

  /** Вызывается когда пользователь ввёл ключ расшифровки */
  const unlockWithKey = useCallback(async (key: string) => {
    const data = cachedData.current
    if (!data) return

    setState({ status: 'decrypting' })

    try {
      const plaintext = await decryptWithKey(data, key.trim())
      setState({ status: 'success', plaintext })
    } catch {
      // AES-GCM бросает ошибку при неверном ключе
      setState({ status: 'needs_key', passwordError: 'wrong_password' })
    }
  }, [])

  return { state, loadSecret, unlockWithKey }
}
