import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Logo from '../components/Logo.jsx'

function Conversation() {
  const { otherId } = useParams()
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  const [myRole, setMyRole] = useState(null)
  const [otherProfile, setOtherProfile] = useState(null)
  const [thread, setThread] = useState([])
  const [loadingThread, setLoadingThread] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !session) navigate('/login')
  }, [loading, session, navigate])

  useEffect(() => {
    if (!session) return

    async function load() {
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      setMyRole(myProfile?.role ?? null)

      const { data: other } = await supabase
        .from('profiles')
        .select('full_name, verified, role')
        .eq('id', otherId)
        .single()
      setOtherProfile(other)
    }

    load()
  }, [session, otherId])

  useEffect(() => {
    if (!session || !myRole) return

    const buyerId = myRole === 'vendor' ? otherId : session.user.id
    const vendorId = myRole === 'vendor' ? session.user.id : otherId

    async function loadThread() {
      setLoadingThread(true)
      const { data } = await supabase
        .from('messages')
        .select('id, message, created_at, sender_id')
        .eq('buyer_id', buyerId)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: true })
      setThread(data ?? [])
      setLoadingThread(false)
    }

    loadThread()
  }, [session, myRole, otherId])

  async function handleReply(e) {
    e.preventDefault()
    setError('')

    if (!replyText.trim()) return

    const buyerId = myRole === 'vendor' ? otherId : session.user.id
    const vendorId = myRole === 'vendor' ? session.user.id : otherId

    setSending(true)

    const { data, error: insertError } = await supabase
      .from('messages')
      .insert({
        buyer_id: buyerId,
        vendor_id: vendorId,
        sender_id: session.user.id,
        message: replyText.trim(),
      })
      .select('id, message, created_at, sender_id')
      .single()

    setSending(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setThread((prev) => [...prev, data])
    setReplyText('')
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-body flex flex-col">
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo color="#F04E37" size={24} />
            <span className="font-display text-2xl font-bold text-ink">Creve</span>
          </Link>
          <Link to="/messages" className="text-sm font-semibold text-ink/70 hover:text-ink">
            All messages
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-6 flex flex-col">
        <div className="flex items-center gap-2 mb-5">
          <h1 className="font-display font-bold text-xl text-ink">
            {otherProfile?.full_name ?? 'Conversation'}
          </h1>
          {otherProfile?.role === 'vendor' && otherProfile?.verified && (
            <VerifiedDot />
          )}
        </div>

        <div className="flex-1 space-y-3 mb-5">
          {loadingThread && <p className="text-sm text-ink/50">Loading…</p>}

          {!loadingThread && thread.length === 0 && (
            <p className="text-sm text-ink/50">
              No messages yet — say hello below.
            </p>
          )}

          {thread.map((msg) => {
            const isMine = msg.sender_id === session.user.id
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine
                      ? 'bg-coral text-white rounded-br-md'
                      : 'bg-white border border-line text-ink rounded-bl-md'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            )
          })}
        </div>

        <form onSubmit={handleReply} className="flex gap-2 sticky bottom-0 pb-4">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-coral outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={sending}
            className="font-bold text-sm px-5 py-3 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors disabled:opacity-60 shrink-0"
          >
            Send
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 mb-4">
            {error}
          </p>
        )}
      </main>
    </div>
  )
}

function VerifiedDot() {
  return (
    <span
      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-coral"
      aria-label="Verified vendor"
    >
      <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none">
        <path
          d="M2.5 6.2L4.8 8.5L9.5 3.5"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default Conversation
