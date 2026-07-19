import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import { hasPremiumAccess, premiumStatusLabel } from '../hooks/usePremiumAccess.js'
import Logo from '../components/Logo.jsx'
import { ArrowLeft, Crown, Check, BadgeCheck } from 'lucide-react'

const PLAN_AMOUNT_NAIRA = 1000

function Upgrade() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (!loading && !session) navigate('/login')
  }, [loading, session, navigate])

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoadingProfile(false)
      })
  }, [session])

  useEffect(() => {
    if (document.getElementById('paystack-inline-script')) {
      setScriptLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'paystack-inline-script'
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)
  }, [])

  function handleSubscribe() {
    if (!scriptLoaded || !window.PaystackPop) {
      setError('Payment is still loading — try again in a moment.')
      return
    }

    setError('')

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: session.user.email,
      amount: PLAN_AMOUNT_NAIRA * 100,
      currency: 'NGN',
      ref: `creve_${session.user.id}_${Date.now()}`,
      callback: (response) => {
        verifyPayment(response.reference)
      },
      onClose: () => {
        // user closed the Paystack popup — nothing to do
      },
    })

    handler.openIframe()
  }

  async function verifyPayment(reference) {
    setPaying(true)
    setError('')

    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, userId: session.user.id }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Payment verification failed.')
        setPaying(false)
        return
      }

      setProfile((prev) => ({ ...prev, subscribed_until: data.subscribed_until }))
      setPaying(false)
    } catch (err) {
      setError('Could not reach the server to verify payment.')
      setPaying(false)
    }
  }

  if (loading || loadingProfile || !session) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    )
  }

  const isPremium = hasPremiumAccess(profile)

  return (
    <div className="min-h-screen bg-paper text-ink font-body">
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo color="#F04E37" size={24} />
            <span className="font-display text-2xl font-bold text-ink hidden sm:inline">Creve</span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink">
            <ArrowLeft size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 py-10">
        <div className="flex items-center gap-2 mb-2">
          <Crown size={22} strokeWidth={2.5} className="text-amber" />
          <h1 className="font-display font-bold text-2xl text-ink">Creve Premium</h1>
        </div>
        <p className="text-sm text-ink/60 mb-6">{premiumStatusLabel(profile)}</p>

        <div className="border border-line rounded-2xl p-5 bg-white mb-6">
          <p className="font-display font-bold text-xl text-ink mb-1">
            ₦{PLAN_AMOUNT_NAIRA.toLocaleString()}<span className="text-sm font-semibold text-ink/50">/month</span>
          </p>
          <ul className="space-y-2 mt-4">
            {[
              'Unlimited product listings',
              'Post to Story — get seen first on the marketplace',
              'More features as we build them',
            ].map((perk) => (
              <li key={perk} className="flex items-start gap-2 text-sm text-ink/70">
                <Check size={16} strokeWidth={2.5} className="text-coral mt-0.5 shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {isPremium ? (
          <div className="flex items-center justify-center gap-2 font-bold text-sm px-6 py-3.5 rounded-full bg-coral-light text-coral">
            <BadgeCheck size={18} strokeWidth={2.5} />
            You're all set
          </div>
        ) : (
          <>
            <button
              onClick={handleSubscribe}
              disabled={paying}
              className="w-full font-bold text-sm px-6 py-3.5 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors disabled:opacity-60"
            >
              {paying ? 'Confirming…' : 'Subscribe'}
            </button>
            <p className="text-xs text-ink/40 text-center mt-3 leading-relaxed">
              Test mode — no real money is charged. Use card 4084 0840 8408 4081,
              any future expiry, CVV 408, and any OTP.
            </p>
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 mt-4">
            {error}
          </p>
        )}
      </main>
    </div>
  )
}

export default Upgrade
