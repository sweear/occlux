import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export function NotFoundPage() {
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '12px' }}>
          Page Not Found
        </h2>
        <Link to="/"><Button variant="ghost">Go Home</Button></Link>
      </div>
    </div>
  )
}
