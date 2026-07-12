import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Logo from '../components/Logo.jsx'

function Welcome() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login')
    }
  }, [loading, session, navigate])

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('full_name, role, department, level')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
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
      <header className="px-5 h-16 flex items-center justify-between border-b border-line">
        <span className="flex items-center gap-2">
          <Logo color="#F04E37" size={24} />
          <span className="font-display text-2xl font-bold text-ink">Creve</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-ink/60 hover:text-ink"
        >
          Log out
        </button>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-14 text-center">
        <div className="w-14 h-14 rounded-full bg-coral-light flex items-center justify-center mx-auto mb-5">
          <span className="font-display font-semibold text-coral text-lg">
            {profile?.full_name?.[0] ?? '…'}
          </span>
        </div>
        <h1 className="font-display font-semibold text-2xl text-ink mb-2">
          You're in, {profile?.full_name?.split(' ')[0] ?? ''}.
        </h1>
        <p className="text-sm text-ink/60 leading-relaxed mb-1">
          {profile?.role === 'vendor'
            ? `Signed up as a vendor — ${profile.department}, ${profile.level} level.`
            : 'Signed up as a buyer.'}
        </p>
        {profile?.role === 'vendor' && (
          <p className="text-xs text-amber font-semibold mt-3 bg-amber/10 inline-block px-3 py-1.5 rounded-full">
            Verification pending review
          </p>
        )}
        <p className="text-sm text-ink/50 mt-8 leading-relaxed">
          The marketplace and dashboard are next — this screen confirms your
          account and profile were created correctly.
        </p>
        <Link
          to={profile?.role === 'vendor' ? '/dashboard' : '/marketplace'}
          className="inline-block mt-6 font-bold text-sm px-6 py-3 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors"
        >
          {profile?.role === 'vendor' ? 'Go to your dashboard' : 'Browse the marketplace'}
        </Link>
      </main>
    </div>
  )
}

export default Welcome
