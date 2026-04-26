import { useState } from 'react'
import type { Lang } from '@/types'

function detectLang(): Lang {
  const l = (navigator.language || '').toLowerCase()
  return l.startsWith('ru') ? 'ru' : 'en'
}

export function useLang() {
  const [lang, setLang] = useState<Lang>(detectLang)
  return { lang, setLang }
}
