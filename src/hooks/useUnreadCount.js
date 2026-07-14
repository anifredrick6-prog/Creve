import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useUnreadCount(session) {
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (!session) {
      setHasUnread(false)
      return
    }

    async function check() {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('read', false)
        .neq('sender_id', session.user.id)
        .or(`buyer_id.eq.${session.user.id},vendor_id.eq.${session.user.id}`)
      setHasUnread((count ?? 0) > 0)
    }

    check()
  }, [session])

  return hasUnread
}
