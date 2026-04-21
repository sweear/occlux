/**
 * pages/ViewPage.tsx
 *
 * Честные тексты:
 * - Confirm: не говорим "permanently destroyed" — говорим нейтрально
 * - Success/destroyed: бэкенд не возвращает views_remaining, поэтому
 *   честно пишем "этот просмотр засчитан" вместо "уничтожен навсегда"
 *   (секрет мог быть настроен на несколько просмотров)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button, Spinner, Input, Toast } from '@/components/ui'
import { useViewSecret } from '@/hooks/useViewSecret'
import { useLang } from '@/hooks/useLang'
import { t } from '@/utils/i18n'

export function ViewPage() {
  const { id } = useParams<{ id: string }>()
  const { lang } = useLang()
  const isRu = lang === 'ru'
  const { state, loadSecret, unlockWithKey } = useViewSecret(id ?? '')

  const [confirmed, setConfirmed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [keyError, setKeyError] = useState('')
  const [cp, setCp] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const tRef = useRef<ReturnType<typeof setTimeout>>()

  const hasFragment = !!window.location.hash.slice(1)

  const showToast = useCallback((m: string) => {
    clearTimeout(tRef.current)
    setToast({ visible: true, message: m })
    tRef.current = setTimeout(() => setToast(s => ({ ...s, visible: false })), 2400)
  }, [])

  useEffect(() => { if (confirmed) loadSecret() }, [confirmed, loadSecret])

  useEffect(() => {
    if (state.status === 'needs_key' && state.passwordError === 'wrong_password') {
      setKeyError(t(lang, 'wrongPassword'))
    }
  }, [state, lang])

  async function handleCopy(text: string) {
    try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
    setCp(true); showToast(t(lang, 'copied'))
    setTimeout(() => setCp(false), 2500)
  }

  async function handleUnlock() {
    if (!keyInput.trim()) return
    setKeyError('')
    await unlockWithKey(keyInput.trim())
  }

  const center: React.CSSProperties = {
    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1.5rem',
  }

  const iconBox = (bg: string, border: string): React.CSSProperties => ({
    width: '64px', height: '64px', borderRadius: '16px', background: bg,
    border: `1px solid ${border}`, display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 22px',
  })

  // ── Idle — confirm ───────────────────────────────────────────────
  if (!confirmed) return (
    <div style={center}>
      <div style={{ maxWidth: '410px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
        <div style={{ ...iconBox('var(--vd)', 'var(--vb)'), animation: 'pulse 3s ease-in-out infinite' }}>
          <i className="fas fa-shield-halved" style={{ color: 'var(--v2)', fontSize: '1.6rem' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--t1)', marginBottom: '9px' }}>
          {t(lang, 'viewTitle')}
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--t2)', lineHeight: 1.65, maxWidth: '340px', margin: '0 auto 20px' }}>
          {isRu
            ? 'Вы получили зашифрованный секрет. Данные хранятся только на сервере — после расшифровки этот просмотр будет засчитан.'
            : "You received an encrypted secret. Data is stored on the server — once revealed, this view will be counted."}
        </p>
        <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', padding: '11px 13px', marginBottom: '22px', background: 'var(--amb-d)', border: '1px solid var(--amb-b)', borderRadius: '10px', textAlign: 'left' }}>
          <i className="fas fa-triangle-exclamation" style={{ color: 'var(--amber)', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '0.78rem', color: 'var(--t2)', lineHeight: 1.5, margin: 0 }}>
            {hasFragment
              ? (isRu
                ? 'Когда будете готовы — нажмите кнопку. Секрет расшифруется прямо в браузере.'
                : 'When ready — click the button. The secret will be decrypted right in your browser.')
              : (isRu
                ? 'После нажатия вам потребуется ввести ключ расшифровки, который вам должен был передать отправитель.'
                : 'After clicking, you will need to enter the decryption key that the sender should have shared with you separately.')}
          </p>
        </div>
        <Button fullWidth size="lg" onClick={() => setConfirmed(true)}>
          <i className="fas fa-eye" />{t(lang, 'revealBtn')}
        </Button>
        <p style={{ fontSize: '0.62rem', color: 'var(--t4)', marginTop: '14px', fontFamily: 'var(--mono)', letterSpacing: '0.03em' }}>
          client-side decryption · AES-256-GCM
        </p>
      </div>
    </div>
  )

  // ── Loading / Decrypting ─────────────────────────────────────────
  if (state.status === 'loading' || state.status === 'decrypting') return (
    <div style={{ ...center, flexDirection: 'column', gap: '16px' }}>
      <Spinner size={30} />
      <span style={{ fontSize: '0.82rem', color: 'var(--t3)' }}>
        {state.status === 'decrypting'
          ? (isRu ? 'Расшифровка...' : 'Decrypting...')
          : (isRu ? 'Загрузка...' : 'Loading...')}
      </span>
    </div>
  )

  // ── Нужен ключ ──────────────────────────────────────────────────
  if (state.status === 'needs_key') return (
    <div style={center}>
      <div style={{ maxWidth: '390px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.25s ease' }}>
        <div style={iconBox('var(--amb-d)', 'var(--amb-b)')}>
          <i className="fas fa-key" style={{ color: 'var(--amber)', fontSize: '1.4rem' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--t1)', marginBottom: '6px' }}>
          {isRu ? 'Введите ключ расшифровки' : 'Enter decryption key'}
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--t2)', marginBottom: '22px' }}>
          {isRu
            ? 'Отправитель должен был передать вам ключ отдельно.'
            : 'The sender should have shared the key with you via a separate channel.'}
        </p>
        <div style={{ textAlign: 'left', marginBottom: '14px' }}>
          <Input
            iconLeft="fa-key"
            placeholder={isRu ? 'Ключ расшифровки' : 'Decryption key'}
            value={keyInput}
            onChange={e => { setKeyInput(e.target.value); setKeyError('') }}
            error={keyError}
            onKeyDown={e => e.key === 'Enter' && keyInput.trim() && handleUnlock()}
            autoFocus
          />
        </div>
        <Button fullWidth size="lg" onClick={handleUnlock} disabled={!keyInput.trim()}>
          <i className="fas fa-unlock-alt" />{t(lang, 'unlockBtn')}
        </Button>
      </div>
    </div>
  )

  // ── Not found ────────────────────────────────────────────────────
  if (state.status === 'not_found') return (
    <div style={center}>
      <div style={{ maxWidth: '370px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
        <div style={iconBox('var(--red-d)', 'var(--red-b)')}>
          <i className="fas fa-skull" style={{ color: 'var(--red)', fontSize: '1.4rem' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--t1)', marginBottom: '8px' }}>
          {t(lang, 'notFoundTitle')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: '28px' }}>
          {isRu
            ? 'Секрет не найден. Возможные причины: уже прочитан, истёк срок хранения, исчерпан лимит просмотров, или ссылка некорректна.'
            : 'Secret not found. Possible reasons: already read, TTL expired, view limit exhausted, or the link is incorrect.'}
        </p>
        <Link to="/"><Button variant="ghost" fullWidth><i className="fas fa-plus" />{t(lang, 'newSecret')}</Button></Link>
      </div>
    </div>
  )

  // ── Error ────────────────────────────────────────────────────────
  if (state.status === 'error') return (
    <div style={center}>
      <div style={{ maxWidth: '370px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
        <div style={iconBox('var(--red-d)', 'var(--red-b)')}>
          <i className="fas fa-exclamation-triangle" style={{ color: 'var(--red)', fontSize: '1.3rem' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px' }}>
          {isRu ? 'Ошибка' : 'Error'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--t2)', marginBottom: '28px' }}>{state.error}</p>
        <Link to="/"><Button variant="ghost" fullWidth><i className="fas fa-arrow-left" />{isRu ? 'На главную' : 'Go home'}</Button></Link>
      </div>
    </div>
  )

  // ── Success — расшифровано ───────────────────────────────────────
  if (state.status === 'success' && state.plaintext !== undefined) {
    return (
      <div style={{ ...center, alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '700px', width: '100%', animation: 'fadeUp 0.3s ease' }}>
          {/* Заголовок */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0, background: 'rgba(52,211,153,0.09)', border: '1px solid rgba(52,211,153,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-envelope-open-text" style={{ color: 'var(--green)', fontSize: '0.7rem' }} />
                </div>
                <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--t1)' }}>
                  {t(lang, 'decryptedTitle')}
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--t2)', margin: '0 0 0 36px' }}>
                {t(lang, 'decryptedSubtitle')}
              </p>
            </div>
            <Button variant="ghost" onClick={() => handleCopy(state.plaintext!)}>
              <i className={`fas fa-${cp ? 'check' : 'copy'}`} style={{ fontSize: '0.73rem' }} />
              {cp ? t(lang, 'copied') : t(lang, 'copyContent')}
            </Button>
          </div>

          {/* Терминальный блок с traffic lights */}
          <div style={{ background: 'rgba(5,5,15,0.82)', border: '1px solid var(--b2)', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', boxShadow: 'inset 0 2px 16px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderBottom: '1px solid var(--b1)', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(248,113,113,0.5)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(245,158,11,0.5)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(52,211,153,0.5)' }} />
              <span style={{ fontSize: '0.61rem', color: 'var(--t3)', marginLeft: '8px', fontFamily: 'var(--mono)' }}>
                decrypted · client-side · AES-256-GCM
              </span>
            </div>
            <div style={{ padding: '18px 20px', fontFamily: 'var(--mono)', fontSize: '0.83rem', lineHeight: 1.85, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'rgba(196,186,255,0.88)' }}>
              {state.plaintext}
            </div>
          </div>

          {/*
            Честный статус — не говорим "permanently destroyed",
            потому что у пользователя могло быть несколько доступных просмотров.
            Бэкенд (Go) не возвращает views_remaining в ответе GET /secrets/:id,
            поэтому мы не знаем сколько осталось.
            Говорим нейтрально: "просмотр засчитан".
          */}
          <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', padding: '10px 14px', background: 'var(--amb-d)', border: '1px solid var(--amb-b)', borderRadius: '10px', fontSize: '0.79rem', color: 'var(--t2)', marginBottom: '24px' }}>
            <i className="fas fa-circle-info" style={{ color: 'var(--amber)', flexShrink: 0, marginTop: '1px' }} />
            <span>
              {isRu
                ? 'Этот просмотр засчитан. Если отправитель разрешил несколько просмотров — ссылка может быть ещё активна. Иначе секрет уже удалён.'
                : 'This view has been counted. If the sender allowed multiple views, the link may still be active. Otherwise, the secret has been deleted.'}
            </span>
          </div>

          <Link to="/"><Button variant="ghost"><i className="fas fa-plus" />{t(lang, 'newSecret')}</Button></Link>
        </div>
        <Toast message={toast.message} visible={toast.visible} />
      </div>
    )
  }

  return null
}
