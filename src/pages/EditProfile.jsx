import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Logo from '../components/Logo.jsx'
import FormField from '../components/FormField.jsx'
import {
  ArrowLeft,
  Lock,
  BadgeCheck,
  Clock,
  PlusCircle,
  Trash2,
  Camera,
} from 'lucide-react'

function EditProfile() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [level, setLevel] = useState('')
  const [socialLinks, setSocialLinks] = useState([])
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    if (!loading && !session) navigate('/login')
  }, [loading, session, navigate])

  useEffect(() => {
    if (!session) return
    async function load() {
      setLoadingProfile(true)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setProfile(data)
        setFullName(data.full_name ?? '')
        setBio(data.bio ?? '')
        setPhone(data.phone ?? '')
        setContactEmail(data.contact_email ?? '')
        setDepartment(data.department ?? '')
        setLevel(data.level ?? '')
        setSocialLinks(data.social_links ?? [])
        setAvatarPreview(data.avatar_url ?? null)
      }
      setLoadingProfile(false)
    }
    load()
  }, [session])

  function handleAvatarChange(file) {
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function addSocialLink() {
    setSocialLinks((prev) => [...prev, { label: '', url: '' }])
  }

  function updateSocialLink(index, field, value) {
    setSocialLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    )
  }

  function removeSocialLink(index) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    let avatarUrl = profile?.avatar_url ?? null

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${session.user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, avatarFile)

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      avatarUrl = publicUrlData.publicUrl
    }

    const cleanLinks = socialLinks.filter((l) => l.label.trim() && l.url.trim())

    const updatePayload = {
      bio,
      phone,
      contact_email: contactEmail,
      department,
      level,
      social_links: cleanLinks,
      avatar_url: avatarUrl,
    }

    // Only send full_name if it's actually editable (not yet verified),
    // so we never trip the name-lock trigger with an unrelated save.
    if (!profile?.verified) {
      updatePayload.full_name = fullName
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', session.user.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading || loadingProfile || !session) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-body">
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo color="#F04E37" size={24} />
            <span className="font-display text-2xl font-bold text-ink hidden sm:inline">
              Creve
            </span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink">
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 py-8">
        <h1 className="font-display font-bold text-2xl text-ink mb-6">Edit profile</h1>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <label className="relative cursor-pointer group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border border-line"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-coral-light flex items-center justify-center font-display font-bold text-coral text-xl">
                  {fullName?.[0] ?? '?'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center border-2 border-paper">
                <Camera size={13} strokeWidth={2.5} />
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          </div>

          {/* Name — locked if verified */}
          <label className="block">
            <span className="text-sm font-semibold text-ink/80 flex items-center gap-1.5">
              Full name
              {profile?.verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber">
                  <Lock size={12} strokeWidth={2.5} />
                  Locked
                </span>
              )}
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={profile?.verified}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-coral outline-none transition-colors disabled:bg-paper disabled:text-ink/50"
            />
            {profile?.verified && (
              <p className="text-xs text-ink/45 mt-1">
                Your name is locked because it's been verified against your NIN.
              </p>
            )}
          </label>

          <div>
            {profile?.verified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-coral bg-coral-light px-2.5 py-1 rounded-full">
                <BadgeCheck size={13} strokeWidth={2.5} />
                Verified vendor
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber bg-amber/10 px-2.5 py-1 rounded-full">
                <Clock size={13} strokeWidth={2.5} />
                Verification pending
              </span>
            )}
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-ink/80">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell buyers a bit about what you sell"
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-coral outline-none transition-colors resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Mechatronics"
            />
            <FormField
              label="Level"
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="e.g. 200"
            />
          </div>

          <FormField
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0801 234 5678"
          />
          <FormField
            label="Contact email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Shown to buyers, separate from your login email"
          />

          <div>
            <span className="text-sm font-semibold text-ink/80">Social links</span>
            <div className="space-y-2 mt-1.5">
              {socialLinks.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateSocialLink(i, 'label', e.target.value)}
                    placeholder="Instagram"
                    className="w-28 shrink-0 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-coral outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                    placeholder="https://instagram.com/…"
                    className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-coral outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(i)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center text-ink/40 hover:text-red-500"
                    aria-label="Remove link"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSocialLink}
              className="mt-2 flex items-center gap-1.5 text-xs font-bold text-coral"
            >
              <PlusCircle size={15} strokeWidth={2.5} />
              Add a link
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full font-bold text-sm px-6 py-3.5 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors disabled:opacity-60"
          >
            {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditProfile
