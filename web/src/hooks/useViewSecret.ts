import { useState, useCallback } from 'react'
import * as cryptoLib from '@/crypto'
import * as api from '@/api/client'
import type { ViewState } from '@/types'

export function useViewSecret(id: string) {
  const [state, setState] = useState<ViewState>({ status: 'idle' })

  const loadSecret = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const keyStr = window.location.hash.slice(1)
      if (!keyStr) {
        setState({ status: 'error', error: 'No decryption key in URL' })
        return
      }

      const res = await api.getSecret(id)
      setState({ status: 'decrypting' })

      const key = await cryptoLib.importKey(keyStr)
      const plaintext = await cryptoLib.decrypt(res.encryptedData, key)
      setState({ status: 'success', plaintext })
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 404) {
        setState({ status: 'not_found' })
      } else {
        setState({ status: 'error', error: err instanceof Error ? err.message : 'Failed' })
      }
    }
  }, [id])

  return { state, loadSecret }
}
