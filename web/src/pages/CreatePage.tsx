import { useState, useRef, useCallback, memo } from 'react'
import { Button, Input, Toast, Chip, FLabel, CopyRow } from '@/components/ui'
import { useCreateSecret } from '@/hooks/useCreateSecret'
import { useLang } from '@/hooks/LangContext'
import { t } from '@/utils/i18n'
import { VALIDATION } from '@/types'

const TTLS = [
  { m: 5,    l: '5 min',  lru: '5 мин'  },
  { m: 60,   l: '1 h',    lru: '1 ч'    },
  { m: 360,  l: '6 h',    lru: '6 ч'    },
  { m: 1440, l: '1 day',  lru: '1 день' },
  { m: 4320, l: '3 days', lru: '3 дня'  },
]

const HeroText = memo(function HeroText({ lang }: { lang: string }) {
  const isRu = lang === 'ru'
  return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px 4px 8px', borderRadius: '999px', background: 'var(--vd)', border: '1px solid var(--vb)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--v2)', marginBottom: '20px', letterSpacing: '0.04em' }}>
        <i className="fas fa-lock" style={{ fontSize: '0.55rem' }} />
        {isRu ? 'Сквозное шифрование' : 'End-to-end encrypted'}
      </div>
      <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05, marginBottom: '16px', background: 'linear-gradient(135deg,#f0eeff 0%,#c4baff 55%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {isRu ? 'Поделись\nсекретом.' : 'Share a\nsecret.'}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--t2)', lineHeight: 1.7, maxWidth: '380px' }}>
        {isRu
          ? 'Зашифруйте данные в браузере и получите ссылку с лимитом просмотров и сроком жизни. Сервер видит только зашифрованный blob — ключ расшифровки хранится только в URL.'
          : 'Encrypt data in your browser and get a link with a view limit and TTL. The server only sees a ciphertext blob — the decryption key lives only in the URL.'}
      </p>
    </div>
  )
})

export function CreatePage() {
  const { lang } = useLang()
  const isRu = lang === 'ru'
  const { state, createSecret, reset } = useCreateSecret()

  const [text, setText] = useState('')
  const [ttl, setTtl] = useState(60)
  const [ttlR, setTtlR] = useState('60')
  const [views, setViews] = useState(1)
  const [viewR, setViewR] = useState('1')
  const [tErr, setTErr] = useState('')
  const [ttlE, setTtlE] = useState('')
  const [vE, setVE] = useState('')
  const [cFull, setCFull] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'info' | 'error' })
  const tr = useRef<ReturnType<typeof setTimeout>>()

  const showToast = useCallback((m: string) => {
    clearTimeout(tr.current)
    setToast({ visible: true, message: m, type: 'success' })
    tr.current = setTimeout(() => setToast(s => ({ ...s, visible: false })), 2400)
  }, [])

  function vTtl(r = ttlR) {
    const v = parseInt(r, 10)
    if (isNaN(v) || v < 1 || v > 4320) { setTtlE(isRu ? '1–4320 мин' : '1–4320 min'); return false }
    setTtl(v); setTtlE(''); return true
  }
  function vViews(r = viewR) {
    const v = parseInt(r, 10)
    if (isNaN(v) || v < 1 || v > 100) { setVE('1–100'); return false }
    setViews(v); setVE(''); return true
  }

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= VALIDATION.SECRET_MAX_CHARS) { setText(val); if (val.trim()) setTErr('') }
  }, [])

  async function handleSubmit() {
    let ok = true
    if (!text.trim()) { setTErr(t(lang, 'errorEmptySecret')); ok = false } else setTErr('')
    if (!vTtl()) ok = false
    if (!vViews()) ok = false
    if (!ok) return
    await createSecret(text, ttl, views)
  }

  const copier = (val: string, fn: (v: boolean) => void) => async () => {
    try { await navigator.clipboard.writeText(val) } catch { /**/ }
    fn(true); showToast(isRu ? 'Скопировано' : 'Copied')
    setTimeout(() => fn(false), 2500)
  }

  const loading = state.status === 'encrypting' || state.status === 'uploading'

  // ── Success ──────────────────────────────────────────────────────
  if (state.status === 'success' && state.shareUrl) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px,6vw,80px) clamp(16px,4vw,48px)' }}>
          <div style={{ maxWidth: '520px', width: '100%', animation: 'fadeUp 0.35s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-check" style={{ color: 'var(--green)', fontSize: '1rem' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--t1)', marginBottom: '2px' }}>
                  {isRu ? 'Секрет создан' : 'Secret created'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>
                  {isRu
                    ? `Доступен ${views > 1 ? `до ${views} раз` : 'только один раз'}`
                    : `Accessible ${views > 1 ? `up to ${views} times` : 'once only'}`}
                </p>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--b2)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <CopyRow
                label={isRu ? 'Ссылка для получателя' : 'Share this link'}
                value={state.shareUrl}
                copied={cFull}
                onCopy={copier(state.shareUrl, setCFull)}
              />
            </div>

            <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', padding: '12px 14px', marginBottom: '20px', background: 'var(--amb-d)', border: '1px solid var(--amb-b)', borderRadius: '12px' }}>
              <i className="fas fa-triangle-exclamation" style={{ color: 'var(--amber)', flexShrink: 0, fontSize: '0.8rem', marginTop: '2px' }} />
              <p style={{ fontSize: '0.76rem', color: 'var(--t2)', lineHeight: 1.55, margin: 0 }}>
                {isRu
                  ? 'Скопируйте ссылку и отправьте получателю. После закрытия этой страницы ссылку можно будет восстановить только из буфера обмена.'
                  : 'Copy the link and send it to the recipient. Once you leave this page, the link can only be recovered from your clipboard.'}
              </p>
            </div>

            <Button variant="ghost" fullWidth onClick={() => { reset(); setText('') }}>
              <i className="fas fa-plus" style={{ fontSize: '0.72rem' }} />
              {t(lang, 'createAnother')}
            </Button>
          </div>
        </div>
        <Footer lang={lang} />
        <Toast message={toast.message} visible={toast.visible} type={toast.type} />
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth: 'var(--cw)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 'clamp(32px,5vw,80px)', alignItems: 'start' }}>

            {/* Left */}
            <div style={{ position: 'sticky', top: '80px', animation: 'fadeUp 0.25s ease' }}>
              <HeroText lang={lang} />
              <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: 'fa-shield-halved', en: 'Zero-knowledge', ru: 'Zero-knowledge', bodyEn: 'AES-256-GCM runs in your browser. The server stores only ciphertext and never sees your data.', bodyRu: 'AES-256-GCM работает в браузере. Сервер хранит только шифртекст.' },
                  { icon: 'fa-hourglass-half', en: 'Auto-destruction', ru: 'Автоудаление', bodyEn: 'Set TTL and view limit. Deleted when the first condition is met.', bodyRu: 'Задайте TTL и лимит просмотров. Удаляется при первом из условий.' },
                  { icon: 'fa-code-branch', en: 'Open source', ru: 'Открытый код', bodyEn: 'Code is on GitHub. Verify the encryption yourself — no trust required.', bodyRu: 'Код на GitHub. Проверьте шифрование сами — никакого доверия.' },
                ].map(f => (
                  <div key={f.icon} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, background: 'var(--vd)', border: '1px solid var(--vb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fas ${f.icon}`} style={{ color: 'var(--v2)', fontSize: '0.7rem' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>{isRu ? f.ru : f.en}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--t2)', lineHeight: 1.55 }}>{isRu ? f.bodyRu : f.bodyEn}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div style={{ animation: 'fadeUp 0.3s ease 0.05s both' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ background: 'rgba(5,5,15,0.85)', border: `1px solid ${tErr ? 'var(--red)' : 'var(--b2)'}`, borderRadius: '14px', overflow: 'hidden', transition: 'border-color var(--tr)', boxShadow: tErr ? '0 0 0 3px var(--red-d)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderBottom: '1px solid var(--b1)', background: 'rgba(255,255,255,0.015)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(248,113,113,0.5)' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(245,158,11,0.5)' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(52,211,153,0.5)' }} />
                    <span style={{ fontSize: '0.56rem', color: 'var(--t3)', marginLeft: '6px', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>
                      {isRu ? 'ввод · AES-256-GCM' : 'input · AES-256-GCM'}
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      placeholder={isRu ? 'Вставьте сообщение, API-ключ, токен, пароль…' : 'Paste your message, API key, token, password…'}
                      value={text}
                      onChange={handleTextChange}
                      style={{ width: '100%', minHeight: '200px', padding: '16px', fontFamily: 'var(--mono)', fontSize: '0.82rem', lineHeight: 1.75, background: 'transparent', color: 'rgba(196,186,255,0.9)', border: 'none', outline: 'none', resize: 'vertical', display: 'block' }}
                    />
                    <span style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '0.56rem', fontFamily: 'var(--mono)', color: text.length / VALIDATION.SECRET_MAX_CHARS > 0.9 ? 'var(--red)' : 'var(--t4)', background: 'rgba(5,5,15,0.9)', padding: '2px 5px', borderRadius: '4px', pointerEvents: 'none' }}>
                      {text.length}/{VALIDATION.SECRET_MAX_CHARS}
                    </span>
                  </div>
                </div>
                {tErr && <span style={{ fontSize: '0.68rem', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}><i className="fas fa-circle-exclamation" style={{ fontSize: '0.58rem' }} />{tErr}</span>}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                  <div>
                    <FLabel icon="fa-hourglass-half">{isRu ? 'Удалить через' : 'Expires after'}</FLabel>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                      {TTLS.map(o => (
                        <Chip key={o.m} active={ttl === o.m && !ttlE} onClick={() => { setTtl(o.m); setTtlR(String(o.m)); setTtlE('') }}>
                          {isRu ? o.lru : o.l}
                        </Chip>
                      ))}
                    </div>
                    <Input type="number" value={ttlR}
                      onChange={e => { setTtlR(e.target.value); setTtlE('') }}
                      onBlur={() => vTtl()}
                      hint={isRu ? 'минуты · макс 4320 (3 дня)' : 'minutes · max 4320 (3 days)'}
                      error={ttlE} />
                  </div>
                  <div style={{ minWidth: '120px' }}>
                    <FLabel icon="fa-eye">{isRu ? 'Просмотры' : 'Max views'}</FLabel>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                      {[1, 2, 5, 10].map(v => (
                        <Chip key={v} active={views === v && !vE} onClick={() => { setViews(v); setViewR(String(v)); setVE('') }}>{v}</Chip>
                      ))}
                    </div>
                    <Input type="number" value={viewR}
                      onChange={e => { setViewR(e.target.value); setVE('') }}
                      onBlur={() => vViews()}
                      hint="1–100" error={vE} />
                  </div>
                </div>
              </div>

              {state.status === 'error' && state.error && (
                <div style={{ padding: '10px 14px', marginBottom: '12px', background: 'var(--red-d)', border: '1px solid var(--red-b)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--red)' }}>
                  <i className="fas fa-triangle-exclamation" style={{ marginRight: '8px' }} />{state.error}
                </div>
              )}

              <Button fullWidth size="lg" loading={loading} disabled={loading} onClick={handleSubmit}>
                {loading
                  ? (state.status === 'encrypting' ? (isRu ? 'Шифрование…' : 'Encrypting…') : (isRu ? 'Отправка…' : 'Uploading…'))
                  : <><i className="fas fa-lock" style={{ fontSize: '0.78rem' }} />{t(lang, 'encryptBtn')}</>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LandingSection lang={lang} />
      <Footer lang={lang} />
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />
    </div>
  )
}

function LandingSection({ lang }: { lang: string }) {
  const isRu = lang === 'ru'
  return (
    <section style={{ borderTop: '1px solid var(--b1)', padding: 'clamp(48px,7vw,88px) clamp(16px,4vw,48px)' }}>
      <div style={{ maxWidth: 'var(--cw)', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 52px' }}>
          <p style={{ fontSize: 'clamp(1.15rem,2.5vw,1.7rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.3, color: 'var(--t1)', marginBottom: '14px' }}>
            {isRu ? 'Секреты, которые живут ровно столько, сколько нужно.' : 'Secrets that live exactly as long as they need to.'}
          </p>
          <p style={{ fontSize: '0.87rem', color: 'var(--t2)', lineHeight: 1.75 }}>
            {isRu
              ? 'Каждый раз, когда пароль или токен уходит в чат или письмо — он там навсегда. OCCLUX решает это: зашифруйте данные в браузере, получите ссылку с заданным сроком жизни и лимитом просмотров, поделитесь ею. Исчерпали лимит — исчезло.'
              : "Every time a password or token goes into a chat or email — it lives there forever. OCCLUX fixes that: encrypt data in the browser, get a link with a TTL and view limit, share it. Limit exhausted — it's gone."}
          </p>
        </div>
        <div className="cards-grid">
          {[
            { icon: 'fa-brain', en: 'Server is blind', ru: 'Сервер не видит данные', bodyEn: 'Encryption runs in your browser with AES-256-GCM. The server receives only the encrypted result.', bodyRu: 'Шифрование работает в вашем браузере через AES-256-GCM. Сервер получает только зашифрованный результат.' },
            { icon: 'fa-bomb', en: 'Auto-delete', ru: 'Автоудаление', bodyEn: 'Set a TTL and a view limit. The secret is deleted when whichever condition is reached first.', bodyRu: 'Задайте TTL и лимит просмотров. Секрет удаляется при первом из наступивших условий.' },
            { icon: 'fa-key', en: 'Key in URL only', ru: 'Ключ только в URL', bodyEn: 'The decryption key is part of the URL fragment (#). Browsers do not send the fragment to the server.', bodyRu: 'Ключ расшифровки находится во фрагменте URL (#). Браузеры не отправляют фрагмент на сервер.' },
            { icon: 'fa-code-branch', en: 'Open source', ru: 'Открытый код', bodyEn: 'The full source code is on GitHub. You can read and verify the encryption implementation yourself.', bodyRu: 'Полный исходный код на GitHub. Вы можете прочитать и проверить реализацию шифрования самостоятельно.' },
            { icon: 'fa-shield-halved', en: 'AES-256-GCM', ru: 'AES-256-GCM', bodyEn: 'Each secret gets a fresh random 256-bit key. AES-GCM provides both encryption and integrity verification.', bodyRu: 'Каждый секрет получает новый случайный 256-битный ключ. AES-GCM обеспечивает шифрование и проверку целостности.' },
            { icon: 'fa-user-slash', en: 'No account', ru: 'Без регистрации', bodyEn: 'No sign-up, no email, no personal data collected. Open the page, paste your secret, get a link.', bodyRu: 'Без регистрации, email и сбора личных данных. Откройте страницу, вставьте секрет, получите ссылку.' },
          ].map(c => (
            <div key={c.icon} style={{ padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--b1)', borderRadius: '12px', transition: 'border-color var(--tr)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--vd)', border: '1px solid var(--vb)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <i className={`fas ${c.icon}`} style={{ color: 'var(--v2)', fontSize: '0.75rem' }} />
              </div>
              <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '5px' }}>{isRu ? c.ru : c.en}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--t2)', lineHeight: 1.6 }}>{isRu ? c.bodyRu : c.bodyEn}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer({ lang }: { lang: string }) {
  const isRu = lang === 'ru'
  return (
    <footer style={{ borderTop: '1px solid var(--b1)', padding: 'clamp(14px,2.5vw,22px) clamp(16px,4vw,48px)' }}>
      <div style={{ maxWidth: 'var(--cw)', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: 'var(--vd)', border: '1px solid var(--vb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-bolt-lightning" style={{ color: 'var(--v2)', fontSize: '0.58rem' }} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--t2)', letterSpacing: '0.04em' }}>OCCLUX</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--t3)', fontFamily: 'var(--mono)' }}>AES-256-GCM · zero-knowledge</span>
        <a href="https://github.com/sweear/occlux" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--t2)', textDecoration: 'none', transition: 'color var(--tr)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--v2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t2)' }}>
          <i className="fab fa-github" style={{ fontSize: '0.9rem' }} />
          {isRu ? 'Открытый код' : 'Open source'}
        </a>
      </div>
    </footer>
  )
}
