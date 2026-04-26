import { useState, useCallback } from 'react'
import * as crypto from '@/crypto'
import * as api from '@/api/client'
import type { CreateState } from '@/types'

export function useCreateSecret() {
  const [state, setState] = useState<CreateState>({ status: 'idle' })

  const createSecret = useCallback(async (text: string, ttlMinutes: number, maxViews: number) => {
    setState({ status: 'encrypting' })
    try {
      const key = await crypto.generateKey()
      const encryptedData = await crypto.encrypt(text, key)
      const keyStr = await crypto.exportKey(key)

      setState({ status: 'uploading' })
      const res = await api.createSecret({ encryptedData, ttlMinutes, maxViews })

      const base = `${window.location.origin}/s/${res.id}`
      setState({
        status: 'success',
        shareUrl: `${base}#${keyStr}`,
        shortUrl: base,
        keyStr,
      })
    } catch (err) {
      setState({ status: 'error', error: err instanceof Error ? err.message : 'Unexpected error' })
    }
  }, [])

  const reset = useCallback(() => setState({ status: 'idle' }), [])
  return { state, createSecret, reset }
}
