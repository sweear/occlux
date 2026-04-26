import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button, Spinner, Toast } from '@/components/ui'
import { useViewSecret } from '@/hooks/useViewSecret'
import { useLang } from '@/hooks/LangContext'
import { t } from '@/utils/i18n'
import { Footer } from './CreatePage'

export function ViewPage() {
  const { id } = useParams<{ id: string }>()
  const { lang } = useLang()
  const isRu = lang === 'ru'
  const { state, loadSecret } = useViewSecret(id ?? '')

  const [confirmed, setConfirmed] = useState(false)
  const [cp, setCp] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const tRef = useRef<ReturnType<typeof setTimeout>>()

  const showToast = useCallback((m: string) => {
    clearTimeout(tRef.current)
    setToast({ visible: true, message: m })
    tRef.current = setTimeout(() => setToast(s => ({ ...s, visible: false })), 2400)
  }, [])

  useEffect(() => { if (confirmed) loadSecret() }, [confirmed, loadSecret])

  async function handleCopy(text: string) {
    try { await navigator.clipboard.writeText(text) } catch { /**/ }
    setCp(true); showToast(t(lang, 'copied'))
    setTimeout(() => setCp(false), 2500)
  }

  const center: React.CSSProperties = {
    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: 'clamp(32px,6vw,80px) clamp(16px,4vw,48px)',
  }

  const card = (accent: string, accentBorder: string): React.CSSProperties => ({
    width: '56px', height: '56px', borderRadius: '14px',
    background: accent, border: `1px solid ${accentBorder}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
  })

  // ── Confirm ──────────────────────────────────────────────────────
  if (!confirmed) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...center }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
          <div style={{ ...card('var(--vd)', 'var(--vb)'), animation: 'pulse 3s ease-in-out infinite' }}>
            <i className="fas fa-shield-halved" style={{ color: 'var(--v2)', fontSize: '1.4rem' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(1.4rem,3vw,1.7rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--t1)', marginBottom: '10px' }}>
            {isRu ? 'Защищённое сообщение' : 'Protected Message'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--t2)', lineHeight: 1.65, maxWidth: '340px', margin: '0 auto 22px' }}>
            {isRu
              ? 'Вы получили зашифрованный секрет. После нажатия он расшифруется прямо в вашем браузере — сервер содержимое не видит.'
              : 'You received an encrypted secret. After clicking, it will be decrypted right in your browser — the server never sees the content.'}
          </p>
          <Button fullWidth size="lg" onClick={() => setConfirmed(true)}>
            <i className="fas fa-eye" />{t(lang, 'revealBtn')}
          </Button>
          <p style={{ fontSize: '0.6rem', color: 'var(--t4)', marginTop: '14px', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>
            client-side · AES-256-GCM
          </p>
        </div>
      </div>
      <Footer lang={lang} />
    </div>
  )

  // ── Loading / Decrypting ─────────────────────────────────────────
  if (state.status === 'loading' || state.status === 'decrypting') return (
    <div style={{ ...center, flexDirection: 'column', gap: '14px' }}>
      <Spinner size={28} />
      <span style={{ fontSize: '0.8rem', color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
        {state.status === 'decrypting' ? (isRu ? 'расшифровка…' : 'decrypting…') : (isRu ? 'загрузка…' : 'loading…')}
      </span>
    </div>
  )

  // ── Not found ────────────────────────────────────────────────────
  if (state.status === 'not_found') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...center }}>
        <div style={{ maxWidth: '380px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
          <div style={card('var(--red-d)', 'var(--red-b)')}>
            <i className="fas fa-skull" style={{ color: 'var(--red)', fontSize: '1.3rem' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--t1)', marginBottom: '10px' }}>
            {t(lang, 'notFoundTitle')}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--t2)', lineHeight: 1.65, marginBottom: '28px' }}>
            {isRu
              ? 'Секрет не найден. Возможные причины: уже прочитан, истёк срок хранения, исчерпан лимит просмотров или ссылка некорректна.'
              : 'Secret not found. Possible reasons: already read, TTL expired, view limit exhausted, or incorrect link.'}
          </p>
          <Link to="/"><Button variant="ghost" fullWidth><i className="fas fa-plus" />{t(lang, 'newSecret')}</Button></Link>
        </div>
      </div>
      <Footer lang={lang} />
    </div>
  )

  // ── Error ────────────────────────────────────────────────────────
  if (state.status === 'error') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...center }}>
        <div style={{ maxWidth: '380px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
          <div style={card('var(--red-d)', 'var(--red-b)')}>
            <i className="fas fa-exclamation-triangle" style={{ color: 'var(--red)', fontSize: '1.2rem' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px' }}>
            {isRu ? 'Ошибка' : 'Error'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--t2)', marginBottom: '28px' }}>{state.error}</p>
          <Link to="/"><Button variant="ghost" fullWidth><i className="fas fa-arrow-left" />{isRu ? 'На главную' : 'Go home'}</Button></Link>
        </div>
      </div>
      <Footer lang={lang} />
    </div>
  )

  // ── Success ──────────────────────────────────────────────────────
  if (state.status === 'success' && state.plaintext !== undefined) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth: '680px', width: '100%', animation: 'fadeUp 0.3s ease' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-envelope-open-text" style={{ color: 'var(--green)', fontSize: '0.75rem' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--t1)' }}>
                  {t(lang, 'decryptedTitle')}
                </h2>
                <p style={{ fontSize: '0.72rem', color: 'var(--t3)', fontFamily: 'var(--mono)' }}>AES-256-GCM · client-side</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleCopy(state.plaintext!)}>
              <i className={`fas fa-${cp ? 'check' : 'copy'}`} style={{ fontSize: '0.68rem' }} />
              {cp ? t(lang, 'copied') : t(lang, 'copyContent')}
            </Button>
          </div>

          {/* Terminal block */}
          <div style={{ background: 'rgba(5,5,15,0.85)', border: '1px solid var(--b2)', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px', boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 13px', borderBottom: '1px solid var(--b1)', background: 'rgba(255,255,255,0.015)' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(248,113,113,0.5)' }} />
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(245,158,11,0.5)' }} />
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(52,211,153,0.5)' }} />
              <span style={{ fontSize: '0.58rem', color: 'var(--t3)', marginLeft: '6px', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
                decrypted · client-side
              </span>
            </div>
            <div style={{ padding: '18px 20px', fontFamily: 'var(--mono)', fontSize: '0.83rem', lineHeight: 1.85, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'rgba(196,186,255,0.9)', minHeight: '80px' }}>
              {state.plaintext}
            </div>
          </div>

          {/* Info note */}
          <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', padding: '10px 14px', background: 'var(--amb-d)', border: '1px solid var(--amb-b)', borderRadius: '10px', fontSize: '0.76rem', color: 'var(--t2)', marginBottom: '20px' }}>
            <i className="fas fa-circle-info" style={{ color: 'var(--amber)', flexShrink: 0, marginTop: '1px' }} />
            <span>
              {isRu
                ? 'Этот просмотр засчитан. Если отправитель разрешил несколько — ссылка может быть ещё активна.'
                : 'This view has been counted. If multiple views were allowed, the link may still be active.'}
            </span>
          </div>

          <Link to="/"><Button variant="ghost"><i className="fas fa-plus" />{t(lang, 'newSecret')}</Button></Link>
        </div>
      </div>
      <Footer lang={lang} />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )

  return null
}
