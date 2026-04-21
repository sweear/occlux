import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useLang } from '@/hooks/useLang'

export function NotFoundPage() {
  const { lang } = useLang()

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '16px', padding: '4rem 1.5rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '5rem', fontWeight: 300, opacity: 0.2, fontFamily: 'var(--font-display)', letterSpacing: '-4px' }}>
        404
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {lang === 'ru' ? 'Здесь ничего нет.' : 'Nothing here.'}
      </p>
      <Link to="/"><Button variant="ghost">
        <i className="fas fa-arrow-left" />
        {lang === 'ru' ? 'На главную' : 'Go home'}
      </Button></Link>
    </div>
  )
}
