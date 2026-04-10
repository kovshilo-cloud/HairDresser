import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSlots() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSlots = useCallback(async () => {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('slots')
      .select('*, bookings(id, cancelled_at)')
      .eq('is_published', true)
      .gte('slot_time', cutoff)
      .order('slot_time', { ascending: true })
    const slotsWithStatus = (data ?? []).map(slot => ({
      ...slot,
      isBooked: slot.bookings?.some(b => !b.cancelled_at) ?? false,
    }))
    setSlots(slotsWithStatus)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSlots()

    const channel = supabase
      .channel('slot-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slots' }, fetchSlots)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchSlots)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchSlots])

  return { slots, loading, refetch: fetchSlots }
}
