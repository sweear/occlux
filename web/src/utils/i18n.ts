import type { Lang } from '@/types'

const translations = {
  en: {
    encryptBtn: 'Encrypt & Create',
    createAnother: 'Create Another',
    revealBtn: 'Reveal Secret',
    copyContent: 'Copy',
    copied: 'Copied!',
    newSecret: 'Create New Secret',
    notFoundTitle: 'Secret Not Found',
    decryptedTitle: 'Decrypted',
    errorEmptySecret: 'Please enter secret data.',
  },
  ru: {
    encryptBtn: 'Зашифровать и создать',
    createAnother: 'Создать ещё',
    revealBtn: 'Раскрыть секрет',
    copyContent: 'Копировать',
    copied: 'Скопировано!',
    newSecret: 'Создать секрет',
    notFoundTitle: 'Секрет не найден',
    decryptedTitle: 'Расшифровано',
    errorEmptySecret: 'Введите секретные данные.',
  },
} as const

type Key = keyof typeof translations.en

export function t(lang: Lang, key: Key): string {
  return translations[lang][key]
}
