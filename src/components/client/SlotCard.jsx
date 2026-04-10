import { format } from 'date-fns'
import Button from '../shared/Button'

export default function SlotCard({ slot, onBook }) {
  if (slot.isBooked) {
    return (
      <div className="bg-gray-100 rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-400 text-base">
            {format(new Date(slot.slot_time), 'h:mm a')}
          </p>
          <p className="text-xs text-gray-300">{slot.duration} min</p>
        </div>
        <div className="w-full text-center text-sm font-medium text-gray-400 bg-gray-200 rounded-xl py-1.5">
          Booked
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div>
        <p className="font-semibold text-gray-800 text-base">
          {format(new Date(slot.slot_time), 'h:mm a')}
        </p>
        <p className="text-xs text-gray-400">{slot.duration} min</p>
      </div>
      <Button className="w-full text-sm" onClick={() => onBook(slot)}>
        Book
      </Button>
    </div>
  )
}
