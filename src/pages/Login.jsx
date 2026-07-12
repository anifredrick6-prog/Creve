import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import FormField from '../components/FormField.jsx'
import Logo from '../components/Logo.jsx'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate('/welcome')
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-body flex flex-col">
      <header className="px-5 h-16 flex items-center border-b border-line">
        <Link to="/" className="flex items-center gap-2">
          <Logo color="#F04E37" size={24} />
          <span className="font-display text-2xl font-bold text-ink">Creve</span>
        </Link>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-10">
        <h1 className="font-display font-semibold text-3xl text-ink mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-ink/60 mb-6">Log in to your Creve account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <FormField
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold text-sm px-6 py-3.5 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60 text-center">
          New to Creve?{' '}
          <Link to="/signup" className="font-semibold text-coral">
            Create an account
          </Link>
        </p>
      </main>
    </div>
  )
}

export default Login
