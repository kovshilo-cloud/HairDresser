import { format } from 'date-fns'
import Button from '../shared/Button'

export default function BookingConfirmation({ slot, onClose }) {
  return (
    <div className="text-center space-y-4">
      <div className="text-4xl">✓</div>
      <h2 className="text-xl font-semibold text-gray-800">You're booked!</h2>
      <p className="text-gray-600">
        {format(new Date(slot.slot_time), 'EEEE, MMMM d')} at{' '}
        <strong>{format(new Date(slot.slot_time), 'h:mm a')}</strong>
        {' '}({slot.duration} min)
      </p>
      <p className="text-sm text-gray-400">
        A confirmation email with your cancel link has been sent to your inbox.
      </p>
      <Button className="w-full" onClick={onClose}>Done</Button>
    </div>
  )
}
