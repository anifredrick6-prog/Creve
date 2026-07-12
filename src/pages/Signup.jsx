import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import FormField from '../components/FormField.jsx'
import Logo from '../components/Logo.jsx'

function Signup() {
  const navigate = useNavigate()
  const [role, setRole] = useState('buyer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [level, setLevel] = useState('')
  const [schoolAddress, setSchoolAddress] = useState('')
  const [nin, setNin] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (role === 'vendor' && (!nin || !schoolAddress || !department || !level)) {
      setError('Vendors need to fill in every field below — this is what gets you verified.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setError('Something went wrong creating your account. Try again.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      role,
      full_name: fullName,
      department: role === 'vendor' ? department : null,
      level: role === 'vendor' ? level : null,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    if (role === 'vendor') {
      const { error: kycError } = await supabase.from('vendor_kyc').insert({
        user_id: userId,
        nin,
        school_address: schoolAddress,
      })

      if (kycError) {
        setError(kycError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
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
          Create your account
        </h1>
        <p className="text-sm text-ink/60 mb-6">
          Choose how you'll use Creve. You can't switch this later in the demo,
          so pick carefully.
        </p>

        <div className="flex gap-2 mb-7 bg-white border border-line rounded-full p-1">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`flex-1 text-sm font-semibold py-2 rounded-full transition-colors ${
              role === 'buyer' ? 'bg-coral text-white' : 'text-ink/60'
            }`}
          >
            I'm buying
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`flex-1 text-sm font-semibold py-2 rounded-full transition-colors ${
              role === 'vendor' ? 'bg-coral text-white' : 'text-ink/60'
            }`}
          >
            I'm selling
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Full name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ada Nwosu"
          />
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />

          {role === 'vendor' && (
            <div className="border-t border-line pt-4 mt-2 space-y-4">
              <p className="text-xs font-bold tracking-wide uppercase text-amber">
                Verification details
              </p>
              <FormField
                label="Department"
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Fashion Design"
              />
              <FormField
                label="Level"
                type="text"
                required
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="e.g. 200"
              />
              <FormField
                label="School address / hostel"
                type="text"
                required
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                placeholder="e.g. Hostel B, Room 12"
              />
              <FormField
                label="NIN"
                type="text"
                required
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                placeholder="11-digit National ID Number"
              />
              <p className="text-xs text-ink/50 leading-relaxed">
                Your NIN is private — it's only ever checked if a buyer
                reports a problem with your account, and it's never shown
                on your public profile.
              </p>
            </div>
          )}

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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60 text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-coral">
            Log in
          </Link>
        </p>
      </main>
    </div>
  )
}

export default Signup
