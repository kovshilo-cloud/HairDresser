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

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    const { data } = await supabaseAdmin
      .from('slots')
      .select('*, bookings(id, client_name, client_phone, cancelled_at, created_at)')
      .order('slot_time', { ascending: true })
    setSlots(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchSlots() }, [fetchSlots, refreshKey])

  async function handleDelete(slotId) {
    if (!confirm('Delete this slot? Any booking will also be removed.')) return
    await supabaseAdmin.from('slots').delete().eq('id', slotId)
    fetchSlots()
  }

  if (loading) return <Spinner />
  if (slots.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No slots yet.</p>

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-800 p-6 pb-3">All slots</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {slots.map(slot => {
              const status = getStatus(slot)
              const activeBooking = slot.bookings?.find(b => !b.cancelled_at)
              return (
                <tr key={slot.id} className="hover:bg-gray-50">
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
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" className="text-xs text-red-400 hover:text-red-600" onClick={() => handleDelete(slot.id)}>
                      Delete
                    </Button>
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
