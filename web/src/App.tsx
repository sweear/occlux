/**
 * App.tsx — роутер
 *
 * Маршруты:
 *  /        → CreatePage
 *  /s/:id   → ViewPage (принимает #key в фрагменте)
 *  *        → NotFoundPage
 *
 * Go должен отдавать index.html для всех не-API маршрутов (SPA fallback).
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { CreatePage } from '@/pages/CreatePage'
import { ViewPage } from '@/pages/ViewPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CreatePage />} />
          <Route path="/s/:id" element={<ViewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
