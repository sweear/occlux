/**
 * utils/i18n.ts
 *
 * Простой i18n без сторонних библиотек.
 * Добавить язык — добавь ключи в объект translations.
 */

import type { Lang } from '@/types'

export const translations = {
  en: {
    // Header
    tagline: 'secure data transfer with self-destruction',

    // Create page
    createTitle: 'Share a Secret',
    createSubtitle: 'Encrypted in your browser. The server never sees the plaintext.',
    secretLabel: 'Secret data',
    secretPlaceholder: 'Paste your confidential message, token, credentials, private key...',
    expiryLabel: 'Auto-delete after (minutes)',
    expiryHint: 'from 1 minute to 3 days (4320 min)',
    passwordLabel: 'Password protection',
    passwordPlaceholder: 'Optional — extra layer of protection',
    passwordHint: 'The recipient will need this password to decrypt',
    encryptBtn: 'Encrypt & Create',

    // Success
    successTitle: 'Secret Created',
    successSubtitle: 'Share this link. It works only once.',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    warningFragment: '⚠ The key is in the URL fragment (#). Share only over secure channels.',
    createAnother: 'Create Another Secret',

    // View page — confirm
    viewTitle: 'Protected Message',
    viewSubtitle: 'You received a one-time secret. It will be permanently destroyed after viewing.',
    viewWarning: '⚠ Important: once revealed, this message cannot be accessed again. Make sure you are ready.',
    revealBtn: 'Reveal Secret',

    // View page — password
    passwordRequired: 'Password Required',
    passwordRequiredSub: 'This secret is password protected.',
    passwordField: 'Decryption password',
    unlockBtn: 'Unlock',
    wrongPassword: 'Incorrect decryption key. Try again.',

    // View page — success
    decryptedTitle: 'Decrypted Message',
    decryptedSubtitle: 'Save this information — it is gone forever.',
    copyContent: 'Copy',
    destroyedNote: 'This secret has been permanently destroyed.',
    newSecret: 'Create New Secret',

    // View page — not found
    notFoundTitle: 'Secret Not Found',
    notFoundText: 'This secret has already been read, has expired, or never existed.',

    // Errors
    errorEmptySecret: 'Please enter secret data.',
    errorTtlRange: 'Value must be between {min} and {max}.',
    errorGeneral: 'Something went wrong. Please try again.',
  },
  ru: {
    tagline: 'безопасная передача данных с самоуничтожением',
    createTitle: 'Поделиться секретом',
    createSubtitle: 'Шифрование в браузере. Сервер никогда не видит исходный текст.',
    secretLabel: 'Секретные данные',
    secretPlaceholder: 'Вставьте конфиденциальное сообщение, токен, пароль, приватный ключ...',
    expiryLabel: 'Автоудаление через (минуты)',
    expiryHint: 'от 1 минуты до 3 суток (4320 мин)',
    passwordLabel: 'Защита паролем',
    passwordPlaceholder: 'Опционально — дополнительный уровень защиты',
    passwordHint: 'Получателю понадобится этот пароль для расшифровки',
    encryptBtn: 'Зашифровать и создать',
    successTitle: 'Секрет создан',
    successSubtitle: 'Поделитесь этой ссылкой. Она работает только один раз.',
    copyLink: 'Копировать ссылку',
    copied: 'Скопировано!',
    warningFragment: '⚠ Ключ находится в URL фрагменте (#). Делитесь только по защищённым каналам.',
    createAnother: 'Создать ещё один секрет',
    viewTitle: 'Защищённое сообщение',
    viewSubtitle: 'Вы получили одноразовый секрет. Он будет уничтожен после просмотра.',
    viewWarning: '⚠ Важно: после раскрытия доступ к сообщению будет невозможен. Убедитесь, что готовы открыть его сейчас.',
    revealBtn: 'Раскрыть секрет',
    passwordRequired: 'Требуется пароль',
    passwordRequiredSub: 'Этот секрет защищён паролем.',
    passwordField: 'Пароль расшифровки',
    unlockBtn: 'Разблокировать',
    wrongPassword: 'Неверный ключ расшифровки. Попробуйте снова.',
    decryptedTitle: 'Расшифрованное сообщение',
    decryptedSubtitle: 'Сохраните эту информацию — она исчезнет навсегда.',
    copyContent: 'Скопировать',
    destroyedNote: 'Этот секрет был навсегда уничтожен.',
    newSecret: 'Создать новый секрет',
    notFoundTitle: 'Секрет не найден',
    notFoundText: 'Этот секрет уже был прочитан, истёк срок его действия или он никогда не существовал.',
    errorEmptySecret: 'Введите секретные данные.',
    errorTtlRange: 'Значение должно быть от {min} до {max}.',
    errorGeneral: 'Что-то пошло не так. Попробуйте снова.',
  },
} as const

export type TranslationKey = keyof typeof translations.en

export function t(lang: Lang, key: TranslationKey, vars?: Record<string, string | number>): string {
  let str: string = translations[lang][key]
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v))
    })
  }
  return str
}

/** Определяем язык браузера, дефолт русский */
export function detectLang(): Lang {
  const lang = (navigator.language || 'en').toLowerCase()
  return lang.startsWith('ru') ? 'ru' : 'en'
}
