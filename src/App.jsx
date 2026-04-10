import { useState } from 'react'
import ClientPage from './pages/ClientPage'
import AdminPage from './pages/AdminPage'
import CancelPage from './pages/CancelPage'
import ArchivePage from './pages/ArchivePage'

function Header({ view, setView }) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✂️</span>
          <h1 className="text-lg font-bold text-gray-800">Appointment Booking</h1>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {view === 'client' && (
            <button
              onClick={() => setView('admin')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Admin
            </button>
          )}
          {(view === 'admin' || view === 'archive') && (
            <>
              {view === 'admin' ? (
                <button
                  onClick={() => setView('archive')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Archive
                </button>
              ) : (
                <button
                  onClick={() => setView('admin')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Admin
                </button>
              )}
              <button
                onClick={() => { localStorage.removeItem('admin'); setView('client') }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Client view
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  const [view, setView] = useState(
    params.get('admin') !== null || localStorage.getItem('admin') === '1' ? 'admin' : 'client'
  )

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header view={view} setView={setView} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {view === 'admin'   && <AdminPage />}
        {view === 'archive' && <ArchivePage />}
        {view === 'client'  && <ClientPage />}
      </main>
    </div>
  )
}
