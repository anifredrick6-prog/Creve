import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useCartCount(session) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!session) {
      setCount(0)
      return
    }

    async function load() {
      const { data } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('buyer_id', session.user.id)
      const total = (data ?? []).reduce((sum, item) => sum + item.quantity, 0)
      setCount(total)
    }

    load()
  }, [session])

  return count
}
