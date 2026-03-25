import { useState } from 'react'
import { format } from 'date-fns'
import SlotCard from './SlotCard'
import BookingModal from './BookingModal'
import Spinner from '../shared/Spinner'

export default function SlotGrid({ slots, loading }) {
  const [selectedSlot, setSelectedSlot] = useState(null)

  if (loading) return <Spinner />

  if (slots.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-4">✂️</p>
        <p className="text-lg font-medium">No available slots yet</p>
        <p className="text-sm">Check back soon!</p>
      </div>
    )
  }

  // Group by date
  const grouped = slots.reduce((acc, slot) => {
    const key = format(new Date(slot.slot_time), 'yyyy-MM-dd')
    if (!acc[key]) acc[key] = []
    acc[key].push(slot)
    return acc
  }, {})

  return (
    <>
      <div className="space-y-6">
        {Object.entries(grouped).map(([dateKey, daySlots]) => (
          <div key={dateKey}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {format(new Date(dateKey + 'T12:00:00'), 'EEEE, MMMM d')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {daySlots.map(slot => (
                <SlotCard key={slot.id} slot={slot} onBook={setSelectedSlot} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedSlot && (
        <BookingModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
      )}
    </>
  )
}
