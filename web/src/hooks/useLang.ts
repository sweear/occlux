/**
 * hooks/useLang.ts — глобальный стейт языка
 * Простой синглтон через localStorage, без Redux/Zustand.
 */

import { useState, useEffect } from 'react'
import { detectLang } from '@/utils/i18n'
import type { Lang } from '@/types'

const STORAGE_KEY = 'occlux_lang'

function getSavedLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'ru') return saved
  return detectLang()
}

// Список слушателей изменений языка (pub/sub без контекста)
const listeners = new Set<(lang: Lang) => void>()
let currentLang: Lang = getSavedLang()

function setGlobalLang(lang: Lang) {
  currentLang = lang
  localStorage.setItem(STORAGE_KEY, lang)
  listeners.forEach(fn => fn(lang))
}

export function useLang() {
  const [lang, setLang] = useState<Lang>(currentLang)

  useEffect(() => {
    listeners.add(setLang)
    return () => { listeners.delete(setLang) }
  }, [])

  return {
    lang,
    setLang: setGlobalLang,
  }
}
