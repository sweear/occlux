import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider } from '@/hooks/LangContext'
import { Layout } from '@/components/layout/Layout'
import { CreatePage } from '@/pages/CreatePage'
import { ViewPage } from '@/pages/ViewPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<CreatePage />} />
            <Route path="/s/:id" element={<ViewPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}
