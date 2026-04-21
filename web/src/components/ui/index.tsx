import React, { useState, useCallback, memo } from 'react'

// ─── Button ──────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'success' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}
export const Button = memo(function Button({ children, variant = 'primary', size = 'md', loading = false, fullWidth = false, disabled, style, ...p }: BtnProps) {
  const [h, setH] = useState(false)
  const off = disabled || loading
  const sz  = { sm: '0.4rem 0.9rem', md: '0.65rem 1.4rem', lg: '0.8rem 1.9rem' }
  const fs  = { sm: '0.73rem', md: '0.875rem', lg: '0.93rem' }
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
    width: fullWidth ? '100%' : undefined, padding: sz[size], fontSize: fs[size],
    fontWeight: 600, fontFamily: 'var(--font)', border: '1px solid', borderRadius: '12px',
    cursor: off ? 'not-allowed' : 'pointer', transition: 'all var(--tr)', opacity: off ? 0.36 : 1,
  }
  type Pair = [React.CSSProperties, React.CSSProperties]
  const vs: Record<string, Pair> = {
    primary: [
      { background: 'linear-gradient(135deg,#7c6aff,#9d45ff)', borderColor: 'transparent', color: '#fff', boxShadow: '0 4px 22px rgba(124,106,255,0.38)' },
      { background: 'linear-gradient(135deg,#9080ff,#b055ff)', boxShadow: '0 6px 32px rgba(124,106,255,0.55)' },
    ],
    ghost: [
      { background: 'transparent', borderColor: 'var(--b2)', color: 'var(--t2)' },
      { background: 'rgba(255,255,255,0.03)', borderColor: 'var(--b3)', color: 'var(--t1)' },
    ],
    danger: [
      { background: 'transparent', borderColor: 'var(--red-b)', color: 'var(--red)' },
      { background: 'var(--red-d)', borderColor: 'var(--red)' },
    ],
    success: [
      { background: 'rgba(52,211,153,0.09)', borderColor: 'rgba(52,211,153,0.30)', color: 'var(--green)' },
      { background: 'rgba(52,211,153,0.17)', borderColor: 'var(--green)' },
    ],
    soft: [
      { background: 'var(--vd)', borderColor: 'var(--vb)', color: 'var(--v2)' },
      { background: 'var(--vm)', borderColor: 'var(--v)', boxShadow: '0 0 18px var(--vgl)' },
    ],
  }
  const [n, hv] = vs[variant] ?? vs.primary
  const s = h && !off ? { ...n, ...hv } : n
  const onEnter = useCallback(() => setH(true), [])
  const onLeave = useCallback(() => setH(false), [])
  return (
    <button disabled={off} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ ...base, ...s, ...style }} {...p}>
      {loading && <Spinner size={14} />}{children}
    </button>
  )
})

// ─── Spinner ─────────────────────────────────────────────────────
export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 0.65s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.12" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

// ─── Базовые стили инпута ─────────────────────────────────────────
const inputBase = (focused: boolean, error?: string): React.CSSProperties => ({
  width: '100%', fontFamily: 'var(--font)', fontSize: '0.875rem',
  background: focused ? 'rgba(124,106,255,0.05)' : 'rgba(255,255,255,0.03)',
  color: 'var(--t1)',
  border: `1px solid ${error ? 'var(--red)' : focused ? 'rgba(124,106,255,0.55)' : 'var(--b1)'}`,
  borderRadius: '10px', outline: 'none',
  boxShadow: error ? '0 0 0 3px var(--red-d)' : focused ? '0 0 0 3px rgba(124,106,255,0.10)' : 'none',
  transition: 'border-color 0.13s ease, box-shadow 0.13s ease',
})

// ─── Input ───────────────────────────────────────────────────────
interface InpProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; hint?: string; error?: string; iconLeft?: string
}
export function Input({ label, hint, error, id, iconLeft, style, ...p }: InpProps) {
  const [f, setF] = useState(false)
  const iid = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label htmlFor={iid} style={{ fontSize: '0.67rem', fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {iconLeft && <i className={`fas ${iconLeft}`} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', fontSize: '0.75rem', pointerEvents: 'none' }} />}
        <input id={iid} onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{ ...inputBase(f, error), padding: `0.62rem ${iconLeft ? '1rem' : '0.9rem'} 0.62rem ${iconLeft ? '2.2rem' : '0.9rem'}`, ...style }} {...p} />
      </div>
      {error && <span style={{ fontSize: '0.68rem', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fas fa-circle-exclamation" style={{ fontSize: '0.6rem' }} />{error}</span>}
      {hint && !error && <span style={{ fontSize: '0.68rem', color: 'var(--t3)' }}>{hint}</span>}
    </div>
  )
}

// ─── Textarea — оптимизирована через useCallback ──────────────────
interface TxaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; hint?: string; error?: string; charCount?: number; maxChars?: number
}
export function Textarea({ label, hint, error, charCount, maxChars, style, onChange, ...p }: TxaProps) {
  const [f, setF] = useState(false)
  const pct = maxChars && charCount ? charCount / maxChars : 0
  // onChange не мемоизируем — приходит снаружи, там уже slice
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={{ fontSize: '0.67rem', fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <textarea
          onFocus={() => setF(true)}
          onBlur={() => setF(false)}
          onChange={onChange}
          style={{
            ...inputBase(f, error),
            padding: '0.9rem',
            // НЕ используем resize:vertical — оно тормозит из-за layout recalc
            // Фиксированная высота + overflow:auto
            resize: 'none',
            overflowY: 'auto',
            lineHeight: 1.7,
            ...style,
          }}
          {...p}
        />
        {maxChars !== undefined && charCount !== undefined && (
          <span style={{ position: 'absolute', bottom: '9px', right: '10px', fontSize: '0.58rem', fontFamily: 'var(--mono)', color: pct > 0.9 ? 'var(--red)' : 'var(--t4)', background: 'rgba(5,5,15,0.85)', padding: '2px 6px', borderRadius: '5px', pointerEvents: 'none' }}>
            {charCount}/{maxChars}
          </span>
        )}
      </div>
      {error && <span style={{ fontSize: '0.68rem', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fas fa-circle-exclamation" style={{ fontSize: '0.6rem' }} />{error}</span>}
      {hint && !error && <span style={{ fontSize: '0.68rem', color: 'var(--t3)' }}>{hint}</span>}
    </div>
  )
}

// ─── Toast ───────────────────────────────────────────────────────
export function Toast({ message, visible, type = 'info' }: { message: string; visible: boolean; type?: 'info' | 'error' | 'success' }) {
  const c = { info: 'var(--v)', error: 'var(--red)', success: 'var(--green)' }
  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : '8px'})`, opacity: visible ? 1 : 0, transition: 'all 0.18s ease', pointerEvents: 'none', background: 'var(--s2)', border: '1px solid var(--b2)', borderLeft: `3px solid ${c[type]}`, padding: '0.5rem 1.3rem', borderRadius: '999px', fontWeight: 500, fontSize: '0.82rem', color: 'var(--t1)', zIndex: 1000, whiteSpace: 'nowrap', boxShadow: '0 8px 28px rgba(0,0,0,0.9)' }}>
      {message}
    </div>
  )
}

// ─── Chip ────────────────────────────────────────────────────────
export const Chip = memo(function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: '4px 11px', fontFamily: 'var(--font)', fontSize: '0.71rem', fontWeight: 500, border: `1px solid ${active ? 'var(--vb)' : h ? 'var(--b2)' : 'var(--b1)'}`, borderRadius: '8px', background: active ? 'var(--vd)' : 'transparent', color: active ? 'var(--v2)' : h ? 'var(--t2)' : 'var(--t3)', cursor: 'pointer', transition: 'all var(--tr)' }}>
      {children}
    </button>
  )
})

// ─── FLabel ──────────────────────────────────────────────────────
export function FLabel({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '0.67rem', fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '9px', display: 'flex', alignItems: 'center', gap: '5px' }}>
      {icon && <i className={`fas ${icon}`} style={{ fontSize: '0.58rem', color: 'var(--v)' }} />}
      {children}
    </div>
  )
}

// ─── CopyRow ─────────────────────────────────────────────────────
export const CopyRow = memo(function CopyRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  const [h, setH] = useState(false)
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: '13px 0', borderBottom: '1px solid var(--b1)' }}>
      <div style={{ fontSize: '0.67rem', fontWeight: 600, color: h ? 'var(--t2)' : 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', transition: 'color var(--tr)' }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--t2)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', userSelect: 'all', cursor: 'text' }}>
          {value}
        </span>
        <Button size="sm" variant={copied ? 'success' : 'ghost'} onClick={onCopy} style={{ flexShrink: 0 }}>
          <i className={`fas fa-${copied ? 'check' : 'copy'}`} style={{ fontSize: '0.64rem' }} />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
})

// ─── FeatureCard (для секции преимуществ) ────────────────────────
export function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--b1)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'border-color var(--tr)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b2)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--vd)', border: '1px solid var(--vb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`fas ${icon}`} style={{ color: 'var(--v2)', fontSize: '0.85rem' }} />
      </div>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--t1)' }}>{title}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--t2)', lineHeight: 1.6 }}>{body}</div>
    </div>
  )
}
