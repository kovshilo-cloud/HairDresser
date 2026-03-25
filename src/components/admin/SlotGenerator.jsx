import { useState } from 'react'
import { addMinutes, parse, format } from 'date-fns'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import Input from '../shared/Input'
import Button from '../shared/Button'
import SlotPreview from './SlotPreview'

function generateSlots(date, startStr, endStr, durationMin) {
  const base = date + 'T'
  let cur = new Date(base + startStr)
  const end = new Date(base + endStr)
  const slots = []
  while (cur < end) {
    slots.push(new Date(cur))
    cur = addMinutes(cur, durationMin)
  }
  return slots
}

export default function SlotGenerator({ onPublished }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [duration, setDuration] = useState(30)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleGenerate(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!date) { setError('Please select a date.'); return }
    if (startTime >= endTime) { setError('Start time must be before end time.'); return }
    const slots = generateSlots(date, startTime, endTime, Number(duration))
    if (slots.length === 0) { setError('No slots fit in this time range.'); return }
    setPreview(slots)
  }

  async function handlePublish() {
    setLoading(true)
    setError('')
    const rows = preview.map(t => ({
      slot_time: t.toISOString(),
      duration: Number(duration),
      is_published: true,
    }))
    const { error: err } = await supabaseAdmin.from('slots').insert(rows)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setSuccess(`${rows.length} slots published!`)
    setPreview([])
    setDate('')
    onPublished?.()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Create slots</h2>
      <form onSubmit={handleGenerate} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <Input label="Start time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        <Input label="End time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Duration (min)</label>
          <select
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          >
            {[15, 20, 30, 45, 60, 90].map(d => (
              <option key={d} value={d}>{d} min</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-4">
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            Preview slots
          </Button>
        </div>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

      {preview.length > 0 && (
        <>
          <SlotPreview slots={preview} duration={duration} />
          <Button onClick={handlePublish} disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Publishing…' : `Publish ${preview.length} slots`}
          </Button>
        </>
      )}
    </div>
  )
}
