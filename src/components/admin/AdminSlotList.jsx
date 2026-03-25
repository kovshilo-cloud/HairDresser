import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import Spinner from '../shared/Spinner'
import Button from '../shared/Button'

function getStatus(slot) {
  if (!slot.bookings || slot.bookings.length === 0) return 'available'
  const active = slot.bookings.find(b => !b.cancelled_at)
  if (active) return 'booked'
  return 'available'
}

const statusBadge = {
  available: 'bg-green-100 text-green-700',
  booked: 'bg-amber-100 text-amber-700',
}

export default function AdminSlotList({ refreshKey }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [deleting, setDeleting] = useState(false)

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    const { data } = await supabaseAdmin
      .from('slots')
      .select('*, bookings(id, client_name, client_phone, cancelled_at, created_at)')
      .order('slot_time', { ascending: true })
    setSlots(data ?? [])
    setSelected(new Set())
    setLoading(false)
  }, [])

  useEffect(() => { fetchSlots() }, [fetchSlots, refreshKey])

  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(prev => prev.size === slots.length ? new Set() : new Set(slots.map(s => s.id)))
  }

  async function handleDeleteSelected() {
    if (!confirm(`Delete ${selected.size} slot(s)? Any bookings will also be removed.`)) return
    setDeleting(true)
    await supabaseAdmin.from('slots').delete().in('id', [...selected])
    setDeleting(false)
    fetchSlots()
  }

  if (loading) return <Spinner />
  if (slots.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No slots yet.</p>

  const allSelected = selected.size === slots.length

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-6 pb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">All slots</h2>
        {selected.size > 0 && (
          <Button variant="danger" className="text-sm" onClick={handleDeleteSelected} disabled={deleting}>
            {deleting ? 'Deleting…' : `Delete ${selected.size} selected`}
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
              </th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Client</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {slots.map(slot => {
              const status = getStatus(slot)
              const activeBooking = slot.bookings?.find(b => !b.cancelled_at)
              const isSelected = selected.has(slot.id)
              return (
                <tr
                  key={slot.id}
                  className={`cursor-pointer ${isSelected ? 'bg-rose-50' : 'hover:bg-gray-50'}`}
                  onClick={() => toggleOne(slot.id)}
                >
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleOne(slot.id)} onClick={e => e.stopPropagation()} className="rounded" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {format(new Date(slot.slot_time), 'MMM d, h:mm a')}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{slot.duration} min</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[status]}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {activeBooking ? (
                      <span>{activeBooking.client_name} · {activeBooking.client_phone}</span>
                    ) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
