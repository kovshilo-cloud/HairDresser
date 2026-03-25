import { useSlots } from '../hooks/useSlots'
import SlotGrid from '../components/client/SlotGrid'

export default function ClientPage() {
  const { slots, loading } = useSlots()
  return <SlotGrid slots={slots} loading={loading} />
}
