import { format } from 'date-fns'

export default function SlotPreview({ slots, duration }) {
  if (slots.length === 0) return null
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
      <p className="text-sm font-medium text-gray-600">{slots.length} slots to publish:</p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((t, i) => (
          <li key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
            {format(t, 'h:mm a')}
            <span className="text-gray-400 text-xs ml-1">({duration}m)</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
