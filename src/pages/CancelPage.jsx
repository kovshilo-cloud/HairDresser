import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/shared/Button'
import Spinner from '../components/shared/Spinner'

export default function CancelPage({ token }) {
  const [booking, setBooking] = useState(null)
  const [status, setStatus] = useState('loading') // loading | found | not_found | already_cancelled | cancelled
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('bookings')
        .select('*, slots(slot_time, duration)')
        .eq('cancel_token', token)
        .single()
      if (!data) { setStatus('not_found'); return }
      if (data.cancelled_at) { setStatus('already_cancelled'); return }
      setBooking(data)
      setStatus('found')
    }
    load()
  }, [token])

  async function handleCancel() {
    setConfirming(true)
    await supabase
      .from('bookings')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('cancel_token', token)
    setStatus('cancelled')
    setConfirming(false)
  }

  if (status === 'loading') return <Spinner />

  if (status === 'not_found') return (
    <div className="text-center py-16 text-gray-500">
      <p className="text-4xl mb-4">🔍</p>
      <p className="font-medium">Booking not found.</p>
      <p className="text-sm mt-1">This link may be invalid or already expired.</p>
    </div>
  )

  if (status === 'already_cancelled') return (
    <div className="text-center py-16 text-gray-500">
      <p className="text-4xl mb-4">✓</p>
      <p className="font-medium">This appointment was already cancelled.</p>
    </div>
  )

  if (status === 'cancelled') return (
    <div className="text-center py-16 text-gray-500">
      <p className="text-4xl mb-4">✓</p>
      <p className="font-semibold text-gray-700">Appointment cancelled.</p>
      <p className="text-sm mt-1">The slot is now available for others.</p>
    </div>
  )

  return (
    <div className="max-w-sm mx-auto text-center space-y-4 py-12">
      <p className="text-4xl">✂️</p>
      <h2 className="text-xl font-semibold text-gray-800">Cancel appointment</h2>
      <div className="bg-gray-50 rounded-xl p-4 text-left space-y-1">
        <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {booking.client_name}</p>
        <p className="text-sm text-gray-600"><span className="font-medium">Time:</span> {format(new Date(booking.slots.slot_time), 'EEEE, MMMM d')} at {format(new Date(booking.slots.slot_time), 'h:mm a')}</p>
        <p className="text-sm text-gray-600"><span className="font-medium">Duration:</span> {booking.slots.duration} min</p>
      </div>
      <Button variant="danger" className="w-full" onClick={handleCancel} disabled={confirming}>
        {confirming ? 'Cancelling…' : 'Cancel my appointment'}
      </Button>
      <p className="text-xs text-gray-400">This cannot be undone.</p>
    </div>
  )
}
