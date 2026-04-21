/**
 * Layout.tsx — sticky header как в референсе, с иконкой-молнией вместо лого
 * + переключатель языка справа вместо строки "encrypted · zero-knowledge..."
 */
import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useLang } from '@/hooks/useLang'
import { t } from '@/utils/i18n'
import type { Lang } from '@/types'

export function Layout() {
  const { lang, setLang } = useLang()
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  function handleLogoClick() {
    if (window.location.pathname === '/') window.location.reload()
    else navigate('/')
  }

  return (
    <>
      <header style={{
        height: '58px', display: 'flex', alignItems: 'center',
        padding: '0 clamp(16px,4vw,48px)',
        borderBottom: '1px solid var(--b1)',
        background: 'rgba(5,5,15,0.75)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 'var(--cw)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Лого — иконка + название */}
          <button onClick={handleLogoClick}
            style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg,rgba(124,106,255,0.18),rgba(168,85,247,0.14))',
              border: '1px solid var(--vb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-bolt-lightning" style={{ color: 'var(--v2)', fontSize: '0.78rem' }} />
            </div>
            <span style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.025em', color: 'var(--t1)' }}>
              OCCLUX
            </span>
          </button>

          {/* Язык вместо "encrypted · zero-knowledge..." */}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button onClick={e => { e.stopPropagation(); setLangOpen(o => !o) }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--b2)', borderRadius: '8px', padding: '0.35rem 0.8rem', fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', color: 'var(--t3)', fontFamily: 'var(--font)', transition: 'all var(--tr)', letterSpacing: '0.05em' }}>
              {lang === 'en' ? 'EN' : 'RU'}
              <i className="fas fa-chevron-down" style={{ fontSize: '0.5rem' }} />
            </button>
            {langOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 5px)', right: 0, background: 'var(--s2)', border: '1px solid var(--b2)', borderRadius: '10px', overflow: 'hidden', width: '110px', zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.9)' }}>
                {(['en', 'ru'] as Lang[]).map(l => (
                  <button key={l} onClick={() => { setLang(l); setLangOpen(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.55rem 0.9rem', background: lang === l ? 'var(--vd)' : 'transparent', border: 'none', color: lang === l ? 'var(--v2)' : 'var(--t3)', fontFamily: 'var(--font)', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' }}>
                    {l === 'en' ? 'English' : 'Русский'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </>
  )
}
