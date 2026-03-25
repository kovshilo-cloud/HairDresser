import { useState } from 'react'
import ClientPage from './pages/ClientPage'
import AdminPage from './pages/AdminPage'
import CancelPage from './pages/CancelPage'

function Header({ isAdmin, onAdminToggle }) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✂️</span>
          <h1 className="text-lg font-bold text-gray-800">Appointment Booking</h1>
        </div>
        <button
          onClick={onAdminToggle}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isAdmin ? '← Client view' : 'Admin'}
        </button>
      </div>
    </header>
  )
}

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  // Cancel flow — standalone page, no nav needed
  if (token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">✂️</span>
            <h1 className="text-lg font-bold text-gray-800">Appointment Booking</h1>
          </div>
          <CancelPage token={token} />
        </div>
      </div>
    )
  }

  const [isAdmin, setIsAdmin] = useState(
    params.get('admin') !== null || sessionStorage.getItem('admin') === '1'
  )

  function toggleAdmin() {
    const next = !isAdmin
    if (!next) sessionStorage.removeItem('admin')
    setIsAdmin(next)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={isAdmin} onAdminToggle={toggleAdmin} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {isAdmin ? <AdminPage /> : <ClientPage />}
      </main>
    </div>
  )
}
