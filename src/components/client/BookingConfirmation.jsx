import { useState } from 'react'
import { format } from 'date-fns'
import Button from '../shared/Button'

export default function BookingConfirmation({ slot, cancelToken, onClose }) {
  const [copied, setCopied] = useState(false)
  const cancelUrl = `${window.location.origin}/?token=${cancelToken}`

  function copyLink() {
    navigator.clipboard.writeText(cancelUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="text-center space-y-4">
      <div className="text-4xl">✓</div>
      <h2 className="text-xl font-semibold text-gray-800">You're booked!</h2>
      <p className="text-gray-600">
        {format(new Date(slot.slot_time), 'EEEE, MMMM d')} at{' '}
        <strong>{format(new Date(slot.slot_time), 'h:mm a')}</strong>
        {' '}({slot.duration} min)
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
        <p className="text-sm font-medium text-amber-800">Save your cancel link</p>
        <p className="text-xs text-amber-700 break-all">{cancelUrl}</p>
        <Button variant="secondary" className="w-full text-sm" onClick={copyLink}>
          {copied ? 'Copied!' : 'Copy cancel link'}
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        Use this link if you need to cancel your appointment.
      </p>

      <Button className="w-full" onClick={onClose}>Done</Button>
    </div>
  )
}
