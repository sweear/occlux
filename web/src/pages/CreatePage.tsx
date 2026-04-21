import { useState, useRef, useCallback, memo } from 'react'
import { Button, Input, Toast, Chip, FLabel, CopyRow, FeatureCard } from '@/components/ui'
import { useCreateSecret, generateDecryptKey } from '@/hooks/useCreateSecret'
import { useLang } from '@/hooks/useLang'
import { t } from '@/utils/i18n'
import { VALIDATION } from '@/types'

const TTLS = [
  { m: 5,    l: '5 min',  lru: '5 мин'  },
  { m: 60,   l: '1 h',    lru: '1 ч'    },
  { m: 360,  l: '6 h',    lru: '6 ч'    },
  { m: 1440, l: '1 day',  lru: '1 день' },
  { m: 4320, l: '3 days', lru: '3 дня'  },
]

// Мемоизированная левая колонка — не перерисовывается при каждом вводе
const HeroPanel = memo(function HeroPanel({ lang, views }: { lang: string; views: number }) {
  const isRu = lang === 'ru'
  return (
    <div style={{ position: 'sticky', top: '80px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px 4px 8px', borderRadius: '999px', background: 'var(--vd)', border: '1px solid var(--vb)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--v2)', marginBottom: '22px' }}>
        <i className="fas fa-lock" style={{ fontSize: '0.6rem' }} />
        {isRu ? 'Сквозное шифрование' : 'End-to-end encrypted'}
      </div>

      <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05, marginBottom: '14px', background: 'linear-gradient(135deg,#f0eeff 0%,#c4baff 55%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {isRu ? 'Поделись\nСекретом.' : 'Share a\nSecret.'}
      </h1>

      <p style={{ fontSize: '0.88rem', color: 'var(--t2)', lineHeight: 1.65, maxWidth: '320px', marginBottom: '32px' }}>
        {isRu
          ? 'Данные шифруются в браузере до отправки. Сервер никогда не видит исходный текст — только зашифрованный блоб.'
          : 'Your data is encrypted in the browser before upload. The server only ever sees ciphertext — never plaintext.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <FeatureRow icon="fa-shield-halved"
          title={isRu ? 'Zero-knowledge' : 'Zero-knowledge'}
          body={isRu ? 'AES-256-GCM локально. Сервер хранит только шифртекст.' : 'AES-256-GCM runs locally. Server stores only ciphertext.'} />
        <FeatureRow icon="fa-hourglass-half"
          title={isRu ? 'Ограниченный доступ' : 'Limited access'}
          body={isRu
            ? `Секрет удаляется после ${views > 1 ? `${views} просмотров` : 'первого прочтения'} или истечения TTL.`
            : `Secret is deleted after ${views > 1 ? `${views} reads` : 'the first read'} or TTL expiry.`} />
        <FeatureRow icon="fa-key"
          title={isRu ? 'Ключ у вас' : 'Key stays yours'}
          body={isRu ? 'Ключ расшифровки никогда не покидает URL фрагмент браузера.' : 'The decryption key never leaves the browser URL fragment.'} />
      </div>
    </div>
  )
})

function FeatureRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0, background: 'var(--vd)', border: '1px solid var(--vb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`fas ${icon}`} style={{ color: 'var(--v2)', fontSize: '0.78rem' }} />
      </div>
      <div>
        <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '0.74rem', color: 'var(--t2)', lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  )
}

export function CreatePage() {
  const { lang } = useLang()
  const isRu = lang === 'ru'
  const { state, createSecret, reset } = useCreateSecret()

  const [text, setText] = useState('')
  const [ttl, setTtl] = useState(60)
  const [ttlR, setTtlR] = useState('60')
  const [views, setViews] = useState(1)
  const [viewR, setViewR] = useState('1')
  const [key, setKey] = useState('')

  const [tErr, setTErr] = useState('')
  const [ttlE, setTtlE] = useState('')
  const [vE, setVE] = useState('')
  const [cFull, setCFull] = useState(false)
  const [cShort, setCShort] = useState(false)
  const [cKey, setCKey] = useState(false)

  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'info' | 'error' | 'success' })
  const tr = useRef<ReturnType<typeof setTimeout>>()

  const showToast = useCallback((m: string, type: 'info' | 'error' | 'success' = 'info') => {
    clearTimeout(tr.current)
    setToast({ visible: true, message: m, type })
    tr.current = setTimeout(() => setToast(s => ({ ...s, visible: false })), 2400)
  }, [])

  function vTtl(r = ttlR): boolean {
    const v = parseInt(r, 10)
    if (isNaN(v) || v < 1 || v > 4320) { setTtlE(isRu ? '1–4320 мин' : '1–4320 min'); return false }
    setTtl(v); setTtlE(''); return true
  }
  function vViews(r = viewR): boolean {
    const v = parseInt(r, 10)
    if (isNaN(v) || v < 1 || v > 100) { setVE('1–100'); return false }
    setViews(v); setVE(''); return true
  }

  // Мемоизируем onChange чтобы Textarea не ре-рендерилась
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= VALIDATION.SECRET_MAX_CHARS) {
      setText(val)
      if (val.trim()) setTErr('')
    }
  }, [])

  async function handleSubmit() {
    let ok = true
    if (!text.trim()) { setTErr(t(lang, 'errorEmptySecret')); ok = false } else setTErr('')
    if (!vTtl()) ok = false
    if (!vViews()) ok = false
    if (!ok) return
    const finalKey = key.trim() || generateDecryptKey()
    if (!key.trim()) setKey(finalKey)
    await createSecret({ text, ttlMinutes: ttl, maxViews: views, decryptKey: finalKey })
  }

  function copier(val: string, fn: (v: boolean) => void) {
    return async () => {
      try { await navigator.clipboard.writeText(val) } catch { /* ignore */ }
      fn(true); showToast(isRu ? 'Скопировано.' : 'Copied.', 'success')
      setTimeout(() => fn(false), 2500)
    }
  }

  const loading = state.status === 'encrypting' || state.status === 'uploading'
  const pad = 'clamp(28px,4vw,56px)'

  // ── Success ──────────────────────────────────────────────────────
  if (state.status === 'success' && state.shareUrl && state.shortUrl && state.decryptKey) {
    return (
      <div style={{ flex: 1, padding: `${pad} clamp(16px,4vw,48px) 60px` }}>
        <div style={{ maxWidth: 'var(--cw)', margin: '0 auto', display: 'grid', gridTemplateColumns: '5fr 6fr', gap: 'clamp(32px,5vw,80px)', alignItems: 'start', animation: 'fadeUp 0.3s ease' }}>

          {/* Левая */}
          <div style={{ paddingTop: '4px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '13px', marginBottom: '20px', background: 'rgba(52,211,153,0.09)', border: '1px solid rgba(52,211,153,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-check" style={{ color: 'var(--green)', fontSize: '1rem' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '10px', background: 'linear-gradient(135deg,#eeeaff 0%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {isRu ? 'Секрет\nСоздан.' : 'Secret\nCreated.'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.65, marginBottom: '24px', maxWidth: '300px' }}>
              {isRu
                ? `Поделитесь ссылкой. Секрет будет доступен ${views > 1 ? `до ${views} раз` : 'только один раз'}.`
                : `Share the link. The secret can be accessed ${views > 1 ? `up to ${views} times` : 'only once'}.`}
            </p>
            {/* Блок предупреждения — без градиентного фона */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', background: 'var(--amb-d)', border: '1px solid var(--amb-b)', borderRadius: '10px' }}>
              <i className="fas fa-triangle-exclamation" style={{ color: 'var(--amber)', flexShrink: 0, fontSize: '0.85rem', marginTop: '1px' }} />
              <p style={{ fontSize: '0.76rem', color: 'var(--t2)', lineHeight: 1.55, margin: 0 }}>
                {isRu
                  ? 'Ключ встроен в URL-фрагмент (#). Отправляйте ссылку только по защищённым каналам.'
                  : 'The key is embedded in the URL fragment (#). Only share via secure channels.'}
              </p>
            </div>
          </div>

          {/* Правая — CopyRow */}
          <div style={{ paddingTop: '4px' }}>
            <CopyRow
              label={isRu ? 'Ссылка с ключом' : 'One-click link'}
              value={state.shareUrl}
              copied={cFull}
              onCopy={copier(state.shareUrl, setCFull)}
            />
            <CopyRow
              label={isRu ? 'Ссылка без ключа' : 'Short link (no key)'}
              value={state.shortUrl}
              copied={cShort}
              onCopy={copier(state.shortUrl, setCShort)}
            />
            <CopyRow
              label={isRu ? 'Ключ расшифровки' : 'Decryption key'}
              value={state.decryptKey}
              copied={cKey}
              onCopy={copier(state.decryptKey, setCKey)}
            />
            <div style={{ paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Подсказка что куда */}
              <p style={{ fontSize: '0.72rem', color: 'var(--t3)', lineHeight: 1.55 }}>
                {isRu
                  ? 'Ссылка с ключом → получатель открывает и сразу видит. Ссылка без ключа + ключ отдельно → максимальная безопасность.'
                  : 'One-click link → recipient opens and sees immediately. Short link + key separately → maximum security.'}
              </p>
              <Button variant="ghost" fullWidth onClick={() => { reset(); setText(''); setKey('') }}>
                <i className="fas fa-plus" style={{ fontSize: '0.75rem' }} />
                {t(lang, 'createAnother')}
              </Button>
            </div>
          </div>
        </div>
        <Toast message={toast.message} visible={toast.visible} type={toast.type} />
      </div>
    )
  }

  // ── Форма ────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: `${pad} clamp(16px,4vw,48px) 0`, flex: 1 }}>
        <div style={{ maxWidth: 'var(--cw)', margin: '0 auto', display: 'grid', gridTemplateColumns: '5fr 6fr', gap: 'clamp(32px,5vw,80px)', alignItems: 'start', animation: 'fadeUp 0.25s ease' }}>

          <HeroPanel lang={lang} views={views} />

          {/* Правая — форма */}
          <div>
            {/* Поле секрета — терминальный стиль как на экране расшифровки */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.67rem', fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                {isRu ? 'Секретные данные' : 'Secret data'}
              </div>
              <div style={{ background: 'rgba(5,5,15,0.82)', border: `1px solid ${tErr ? 'var(--red)' : 'var(--b2)'}`, borderRadius: '12px', overflow: 'hidden', boxShadow: tErr ? '0 0 0 3px var(--red-d)' : 'none', transition: 'border-color var(--tr)' }}>
                {/* Traffic lights */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 13px', borderBottom: '1px solid var(--b1)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(248,113,113,0.45)' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(245,158,11,0.45)' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(52,211,153,0.45)' }} />
                  <span style={{ fontSize: '0.58rem', color: 'var(--t3)', marginLeft: '8px', fontFamily: 'var(--mono)' }}>
                    {isRu ? 'ввод секрета · AES-256-GCM' : 'secret input · AES-256-GCM'}
                  </span>
                </div>
                {/* Само поле */}
                <div style={{ position: 'relative' }}>
                  <textarea
                    placeholder={isRu ? 'Вставьте сообщение, API ключ, токен, пароль…' : 'Paste your message, API key, credentials, token…'}
                    value={text}
                    onChange={handleTextChange}
                    style={{
                      width: '100%',
                      minHeight: '160px',
                      padding: '14px 16px',
                      fontFamily: 'var(--mono)',
                      fontSize: '0.83rem',
                      lineHeight: 1.75,
                      background: 'transparent',
                      color: 'rgba(196,186,255,0.88)',
                      border: 'none',
                      outline: 'none',
                      resize: 'vertical',
                      display: 'block',
                    }}
                  />
                  {/* Счётчик */}
                  <span style={{ position: 'absolute', bottom: '9px', right: '10px', fontSize: '0.58rem', fontFamily: 'var(--mono)', color: text.length / VALIDATION.SECRET_MAX_CHARS > 0.9 ? 'var(--red)' : 'var(--t4)', background: 'rgba(5,5,15,0.85)', padding: '2px 6px', borderRadius: '5px', pointerEvents: 'none' }}>
                    {text.length}/{VALIDATION.SECRET_MAX_CHARS}
                  </span>
                </div>
              </div>
              {tErr && <span style={{ fontSize: '0.68rem', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}><i className="fas fa-circle-exclamation" style={{ fontSize: '0.6rem' }} />{tErr}</span>}
            </div>

            {/* Settings */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                <div>
                  <FLabel icon="fa-hourglass-half">{isRu ? 'Удалить через' : 'Expires after'}</FLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '9px' }}>
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
                <div style={{ minWidth: '110px' }}>
                  <FLabel icon="fa-eye">{isRu ? 'Просмотры' : 'Max views'}</FLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '9px' }}>
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

            {/* Key */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <FLabel icon="fa-key">{isRu ? 'Ключ расшифровки' : 'Decryption key'}</FLabel>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder={isRu ? 'оставьте пустым — сгенерируется автоматически' : 'leave blank — auto-generated'}
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    hint={isRu ? 'получатель использует его для расшифровки' : 'recipient uses this to decrypt'}
                  />
                </div>
                <button
                  onClick={() => { const k = generateDecryptKey(); setKey(k); showToast(isRu ? 'Ключ сгенерирован.' : 'Key generated.', 'success') }}
                  style={{ flexShrink: 0, alignSelf: 'flex-start', height: '36px', padding: '0 12px', fontFamily: 'var(--font)', fontSize: '0.73rem', fontWeight: 500, background: 'transparent', border: '1px solid var(--b2)', borderRadius: '10px', color: 'var(--t3)', cursor: 'pointer', transition: 'all var(--tr)', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--vb)'; el.style.color = 'var(--v2)' }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--b2)'; el.style.color = 'var(--t3)' }}>
                  <i className="fas fa-rotate" style={{ marginRight: '5px', fontSize: '0.67rem' }} />
                  {isRu ? 'Сгенерировать' : 'Generate'}
                </button>
              </div>
            </div>

            {state.status === 'error' && state.error && (
              <div style={{ padding: '10px 14px', marginBottom: '14px', background: 'var(--red-d)', border: '1px solid var(--red-b)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--red)' }}>
                <i className="fas fa-triangle-exclamation" style={{ marginRight: '8px' }} />{state.error}
              </div>
            )}

            <Button fullWidth size="lg" loading={loading} disabled={loading} onClick={handleSubmit}>
              {loading
                ? (state.status === 'encrypting' ? (isRu ? 'Шифрование...' : 'Encrypting...') : (isRu ? 'Отправка...' : 'Uploading...'))
                : <><i className="fas fa-skull" style={{ fontSize: '0.78rem' }} />{t(lang, 'encryptBtn')}</>}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Footer секция ── */}
      <LandingFooter lang={lang} />
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />
    </div>
  )
}

// ── Landing footer — слоган + карточки преимуществ + подвал ──────
function LandingFooter({ lang }: { lang: string }) {
  const isRu = lang === 'ru'
  return (
    <div style={{ marginTop: 'clamp(48px,7vw,96px)', borderTop: '1px solid var(--b1)' }}>
      {/* Слоган — по центру */}
      <div style={{ maxWidth: 'var(--cw)', margin: '0 auto', padding: '56px clamp(16px,4vw,48px) 0' }}>
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 52px' }}>
          <p style={{ fontSize: 'clamp(1.3rem,2.5vw,1.9rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.3, color: 'var(--t1)', marginBottom: '14px' }}>
            {isRu
              ? 'Секреты, которые живут ровно столько, сколько нужно.'
              : 'Secrets that live exactly as long as they need to.'}
          </p>
          <p style={{ fontSize: '0.88rem', color: 'var(--t2)', lineHeight: 1.7 }}>
            {isRu
              ? 'Каждый раз, когда пароль или токен уходит в чат или письмо — он там навсегда. OCCLUX решает это: зашифруйте данные в браузере, получите ссылку с заданным сроком жизни и лимитом просмотров, поделитесь ею. Исчерпали лимит — исчезло.'
              : "Every time a password or token goes into a chat or email — it lives there forever. OCCLUX fixes that: encrypt data in the browser, get a link with a TTL and view limit, share it. Limit exhausted — it's gone."}
          </p>
        </div>

        {/* Карточки преимуществ — ровно 3 в ряд */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '52px' }}>
          <FeatureCard
            icon="fa-brain"
            title={isRu ? 'Сервер — слепой' : 'Server is blind'}
            body={isRu
              ? 'Шифрование происходит в вашем браузере. Сервер принимает только зашифрованный blob и никогда не видит содержимое.'
              : 'Encryption happens in your browser. The server only receives a ciphertext blob and never sees the content.'} />
          <FeatureCard
            icon="fa-bomb"
            title={isRu ? 'Автоудаление' : 'Auto-delete'}
            body={isRu
              ? 'Устанавливайте TTL и лимит просмотров. Секрет удаляется при первом из наступивших условий: просмотры исчерпаны или истёк срок.'
              : 'Set TTL and view count. The secret is deleted on the first of these: views exhausted or TTL expired.'} />
          <FeatureCard
            icon="fa-code-branch"
            title={isRu ? 'Открытый код' : 'Open source'}
            body={isRu
              ? 'Весь исходный код открыт на GitHub. Проверьте алгоритм шифрования сами — никакого доверия на слово.'
              : 'All source code is open on GitHub. Verify the encryption algorithm yourself — no need to trust our word.'} />
          <FeatureCard
            icon="fa-key"
            title={isRu ? 'Два режима ссылки' : 'Two link modes'}
            body={isRu
              ? 'Полная ссылка содержит ключ в URL-фрагменте (#). Короткая — без ключа, передавайте его отдельным каналом.'
              : 'Full link contains the key in the URL fragment (#). Short link has no key — send it via a separate channel.'} />
          <FeatureCard
            icon="fa-shield-halved"
            title={isRu ? 'AES-256-GCM' : 'AES-256-GCM'}
            body={isRu
              ? 'Стандарт военного уровня. Ключ выводится из строки через PBKDF2-SHA256 с 100 000 итерациями.'
              : 'Military-grade standard. Key is derived from your string via PBKDF2-SHA256 with 100,000 iterations.'} />
          <FeatureCard
            icon="fa-globe"
            title={isRu ? 'Без аккаунта' : 'No account'}
            body={isRu
              ? 'Никакой регистрации, email, телефона. Просто зашифруйте и поделитесь.'
              : 'No registration, email, or phone. Just encrypt and share.'} />
        </div>
      </div>

      {/* Подвал */}
      <div style={{ borderTop: '1px solid var(--b1)', padding: 'clamp(16px,3vw,24px) clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth: 'var(--cw)', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg,rgba(124,106,255,0.18),rgba(168,85,247,0.14))', border: '1px solid var(--vb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-bolt-lightning" style={{ color: 'var(--v2)', fontSize: '0.6rem' }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--t2)' }}>OCCLUX</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
              AES-256-GCM · PBKDF2-SHA256
            </span>
            <a
              href="https://github.com/sweear/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--t2)', textDecoration: 'none', transition: 'color var(--tr)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--v2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t2)' }}
            >
              <i className="fab fa-github" style={{ fontSize: '0.9rem' }} />
              sweear / occlux
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
