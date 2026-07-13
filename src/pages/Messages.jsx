import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Logo from '../components/Logo.jsx'

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
        .select(`id, message, created_at, ${otherColumn}, ${otherRelation}`)
        .eq(column, session.user.id)
        .order('created_at', { ascending: false })

      // Collapse to one row per other-party, keeping the most recent message
      const seen = new Map()
      for (const row of data ?? []) {
        const otherId = row[otherColumn]
        if (!seen.has(otherId)) {
          seen.set(otherId, {
            otherId,
            otherName: row.profiles?.full_name ?? 'Unknown',
            verified: row.profiles?.verified,
            lastMessage: row.message,
            lastAt: row.created_at,
          })
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
          <Link to="/marketplace" className="text-sm font-semibold text-ink/70 hover:text-ink">
            Marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display font-bold text-2xl text-ink mb-6">Messages</h1>

        {loadingConvos && <p className="text-sm text-ink/50">Loading…</p>}

        {!loadingConvos && conversations.length === 0 && (
          <p className="text-sm text-ink/50">No conversations yet.</p>
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
                  <span className="font-semibold text-sm text-ink truncate">
                    {convo.otherName}
                  </span>
                  {convo.verified && <VerifiedDot />}
                </div>
                <p className="text-xs text-ink/50 truncate">{convo.lastMessage}</p>
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

function VerifiedDot() {
  return (
    <span
      className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-coral shrink-0"
      aria-label="Verified vendor"
    >
      <svg viewBox="0 0 12 12" className="w-1.5 h-1.5" fill="none">
        <path
          d="M2.5 6.2L4.8 8.5L9.5 3.5"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default Messages
