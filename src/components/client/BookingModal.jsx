import { useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabaseClient'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import Input from '../shared/Input'
import BookingConfirmation from './BookingConfirmation'

export default function BookingModal({ slot, onClose }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [cancelToken, setCancelToken] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !phone.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('bookings')
      .insert({ slot_id: slot.id, client_name: name.trim(), client_phone: phone.trim() })
      .select('cancel_token')
      .single()
    if (err) {
      setLoading(false)
      setError('Could not book this slot. It may have just been taken.')
      return
    }

    // Send confirmation email if provided
    if (email.trim()) {
      try {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email.trim(),
            clientName: name.trim(),
            slotTime: slot.slot_time,
            duration: slot.duration,
            cancelToken: data.cancel_token,
          }),
        })
        const json = await res.json()
        if (!res.ok) setEmailError(`Email error: ${json.error || res.status}`)
      } catch (e) {
        setEmailError(`Email error: ${e.message}`)
      }
    }

    setLoading(false)
    setCancelToken(data.cancel_token)
  }

  if (cancelToken) {
    return (
      <Modal onClose={onClose}>
        {emailError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {emailError}
          </div>
        )}
        <BookingConfirmation slot={slot} cancelToken={cancelToken} onClose={onClose} />
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Book appointment</h2>
      <p className="text-sm text-gray-500 mb-4">
        {format(new Date(slot.slot_time), 'EEEE, MMMM d')} &middot;{' '}
        {format(new Date(slot.slot_time), 'h:mm a')} ({slot.duration} min)
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Your name"
          placeholder="Anna Cohen"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Input
          label="Phone number"
          type="tel"
          placeholder="050-000-0000"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
        <Input
          label="Email (optional)"
          type="email"
          placeholder="anna@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Booking…' : 'Confirm booking'}
        </Button>
      </form>
    </Modal>
  )
}
