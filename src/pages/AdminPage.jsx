import { useState } from 'react'
import AdminLogin from '../components/admin/AdminLogin'
import SlotGenerator from '../components/admin/SlotGenerator'
import AdminSlotList from '../components/admin/AdminSlotList'

export default function AdminPage({ authed, onLogin }) {
  const [refreshKey, setRefreshKey] = useState(0)

  if (!authed) return <AdminLogin onLogin={onLogin} />

  return (
    <div className="space-y-6">
      <SlotGenerator onPublished={() => setRefreshKey(k => k + 1)} />
      <AdminSlotList refreshKey={refreshKey} />
    </div>
  )
}
