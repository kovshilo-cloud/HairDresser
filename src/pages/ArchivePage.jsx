import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import Spinner from '../components/shared/Spinner'

function slotStatus(slot) {
  if (!slot.bookings || slot.bookings.length === 0) return 'no-show'
  const active = slot.bookings.find(b => !b.cancelled_at)
  return active ? 'completed' : 'cancelled'
}

const statusStyle = {
  completed: 'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
  'no-show':  'bg-gray-100 text-gray-500',
}

const statusLabel = {
  completed: 'Completed',
  cancelled:  'Cancelled',
  'no-show':  'No booking',
}

export default function ArchivePage() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    supabase
      .from('slots')
      .select('*, bookings(id, client_name, client_phone, cancelled_at)')
      .lt('slot_time', cutoff)
      .order('slot_time', { ascending: true })
      .then(({ data }) => {
        setSlots(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner />

  if (slots.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-4">📁</p>
        <p className="text-lg font-medium">No archived slots yet</p>
        <p className="text-sm">Past appointments will appear here.</p>
      </div>
    )
  }

  // Group by date, newest date first
  const grouped = slots.reduce((acc, slot) => {
    const key = format(new Date(slot.slot_time), 'yyyy-MM-dd')
    if (!acc[key]) acc[key] = []
    acc[key].push(slot)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort().reverse()

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-800">Archive</h2>
      {sortedDates.map(dateKey => (
        <div key={dateKey}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {format(new Date(dateKey + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Client</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grouped[dateKey].map(slot => {
                  const status = slotStatus(slot)
                  const activeBooking = slot.bookings?.find(b => !b.cancelled_at)
                  const lastBooking = slot.bookings?.[slot.bookings.length - 1]
                  return (
                    <tr key={slot.id} className="text-gray-500">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {format(new Date(slot.slot_time), 'h:mm a')}
                      </td>
                      <td className="px-4 py-3">{slot.duration} min</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[status]}`}>
                          {statusLabel[status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {activeBooking
                          ? `${activeBooking.client_name} · ${activeBooking.client_phone}`
                          : lastBooking
                            ? `${lastBooking.client_name} (cancelled)`
                            : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
