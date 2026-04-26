import { createContext, useContext, useState } from 'react'
import type { Lang } from '@/types'

function detect(): Lang {
  return (navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(detect)
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export function useLang() {
  return useContext(Ctx)
}
