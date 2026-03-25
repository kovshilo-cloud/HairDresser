import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSlots() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSlots = useCallback(async () => {
    const { data } = await supabase
      .from('available_slots')
      .select('*')
      .order('slot_time', { ascending: true })
    setSlots(data ?? [])
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
