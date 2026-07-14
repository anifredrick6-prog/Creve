import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Logo from '../components/Logo.jsx'
import { Store, BadgeCheck, Inbox } from 'lucide-react'

function Messages() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loadingConvos, setLoadingConvos] = useState(true)

  useEffect(() => {
    if (!loading && !session) navigate('/login')
  }, [loading, session, navigate])

  useEffect(() => {
    if (!session) return

    async function load() {
      setLoadingConvos(true)

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const isVendor = myProfile?.role === 'vendor'
      const column = isVendor ? 'vendor_id' : 'buyer_id'
      const otherColumn = isVendor ? 'buyer_id' : 'vendor_id'
      const otherRelation = isVendor
        ? 'profiles!messages_buyer_id_fkey(full_name, verified, role)'
        : 'profiles!messages_vendor_id_fkey(full_name, verified, role)'

      const { data } = await supabase
        .from('messages')
        .select(`id, message, created_at, sender_id, read, ${otherColumn}, ${otherRelation}`)
        .eq(column, session.user.id)
        .order('created_at', { ascending: false })

      // Collapse to one row per other-party, keeping the most recent message,
      // while checking every message in that thread for unread ones.
      const seen = new Map()
      for (const row of data ?? []) {
        const otherId = row[otherColumn]
        const isUnreadForMe = row.sender_id !== session.user.id && !row.read

        if (!seen.has(otherId)) {
          seen.set(otherId, {
            otherId,
            otherName: row.profiles?.full_name ?? 'Unknown',
            verified: row.profiles?.verified,
            lastMessage: row.message,
            lastAt: row.created_at,
            hasUnread: isUnreadForMe,
          })
        } else if (isUnreadForMe) {
          seen.get(otherId).hasUnread = true
        }
      }

      setConversations(Array.from(seen.values()))
      setLoadingConvos(false)
    }

    load()
  }, [session])

  return (
    <div className="min-h-screen bg-paper text-ink font-body">
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo color="#F04E37" size={24} />
            <span className="font-display text-2xl font-bold text-ink">Creve</span>
          </Link>
          <Link to="/marketplace" className="flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink">
            <Store size={16} strokeWidth={2.5} />
            Marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display font-bold text-2xl text-ink mb-6">Messages</h1>

        {loadingConvos && <p className="text-sm text-ink/50">Loading…</p>}

        {!loadingConvos && conversations.length === 0 && (
          <div className="flex flex-col items-center text-center py-10">
            <Inbox size={28} strokeWidth={1.5} className="text-ink/25 mb-2" />
            <p className="text-sm text-ink/50">No conversations yet.</p>
          </div>
        )}

        <div className="space-y-2">
          {conversations.map((convo) => (
            <Link
              key={convo.otherId}
              to={`/messages/${convo.otherId}`}
              className="flex items-center gap-3 border border-line rounded-xl p-4 bg-white hover:border-coral/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-coral-light flex items-center justify-center font-display font-bold text-coral shrink-0">
                {convo.otherName?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm text-ink truncate ${convo.hasUnread ? 'font-bold' : 'font-semibold'}`}>
                    {convo.otherName}
                  </span>
                  {convo.verified && (
                    <BadgeCheck size={14} className="text-coral shrink-0" strokeWidth={2.5} />
                  )}
                  {convo.hasUnread && (
                    <span className="w-2 h-2 rounded-full bg-coral shrink-0" aria-label="Unread" />
                  )}
                </div>
                <p className={`text-xs truncate ${convo.hasUnread ? 'text-ink/80 font-medium' : 'text-ink/50'}`}>
                  {convo.lastMessage}
                </p>
              </div>
              <span className="text-xs text-ink/35 shrink-0">
                {new Date(convo.lastAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Messages
