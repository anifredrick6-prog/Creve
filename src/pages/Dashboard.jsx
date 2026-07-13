import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Logo from '../components/Logo.jsx'
import FormField from '../components/FormField.jsx'

function Dashboard() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !session) navigate('/login')
  }, [loading, session, navigate])

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('full_name, role, department, level, verified')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        if (data && data.role !== 'vendor') navigate('/marketplace')
      })
  }, [session, navigate])

  async function loadProducts() {
    if (!session) return
    setLoadingProducts(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', session.user.id)
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoadingProducts(false)
  }

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    async function loadMessages() {
      if (!session) return
      setLoadingMessages(true)
      const { data } = await supabase
        .from('messages')
        .select('id, message, created_at, buyer_id, profiles!messages_buyer_id_fkey(full_name)')
        .eq('vendor_id', session.user.id)
        .order('created_at', { ascending: false })
      setMessages(data ?? [])
      setLoadingMessages(false)
    }
    loadMessages()
  }, [session])

  async function handleAddProduct(e) {
    e.preventDefault()
    setError('')

    if (!name || !price) {
      setError('Name and price are required.')
      return
    }

    setSubmitting(true)

    let imageUrl = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const filePath = `${session.user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`)
        setSubmitting(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      imageUrl = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase.from('products').insert({
      vendor_id: session.user.id,
      name,
      price: parseFloat(price),
      description,
      image_url: imageUrl,
    })

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setName('')
    setPrice('')
    setDescription('')
    setImageFile(null)
    loadProducts()
  }

  async function handleDelete(productId) {
    await supabase.from('products').delete().eq('id', productId)
    loadProducts()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading || !session || !profile) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-body">
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo color="#F04E37" size={24} />
            <span className="font-display text-2xl font-bold text-ink">Creve</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/marketplace" className="text-sm font-semibold text-ink/70 hover:text-ink">
              Marketplace
            </Link>
            <button onClick={handleLogout} className="text-sm font-semibold text-ink/70 hover:text-ink">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-display font-bold text-2xl text-ink">
            Your listings
          </h1>
          {profile.verified ? (
            <span className="text-xs font-semibold text-coral bg-coral-light px-2.5 py-1 rounded-full">
              Verified
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber bg-amber/10 px-2.5 py-1 rounded-full">
              Pending review
            </span>
          )}
        </div>
        <p className="text-sm text-ink/60 mb-8">
          {profile.department} &middot; {profile.level} level
        </p>

        <form
          onSubmit={handleAddProduct}
          className="border border-line rounded-2xl p-5 bg-white mb-10 space-y-4"
        >
          <h2 className="font-display font-bold text-lg text-ink">Add a product</h2>

          <FormField
            label="Product name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ankara fabric, 6 yards"
          />
          <FormField
            label="Price (₦)"
            type="number"
            required
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 8500"
          />
          <label className="block">
            <span className="text-sm font-semibold text-ink/80">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short details about the product"
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-coral outline-none transition-colors resize-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink/80">Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="mt-1.5 w-full text-sm text-ink/70"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-bold text-sm px-6 py-3.5 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors disabled:opacity-60"
          >
            {submitting ? 'Adding…' : 'Add product'}
          </button>
        </form>

        <h2 className="font-display font-bold text-lg text-ink mb-4">
          {loadingProducts ? 'Loading…' : `${products.length} listing${products.length === 1 ? '' : 's'}`}
        </h2>

        {!loadingProducts && products.length === 0 && (
          <p className="text-sm text-ink/50">
            No products yet — add your first one above.
          </p>
        )}

        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-line rounded-xl p-4 bg-white flex items-center gap-4"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-paper border border-line shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink truncate">{product.name}</p>
                <p className="text-sm text-ink/50">₦{Number(product.price).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleDelete(product.id)}
                className="text-xs font-semibold text-red-500 hover:text-red-600 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <h2 className="font-display font-bold text-lg text-ink mb-4 mt-10">
          Messages
        </h2>

        {loadingMessages && <p className="text-sm text-ink/50">Loading…</p>}

        {!loadingMessages && messages.length === 0 && (
          <p className="text-sm text-ink/50">
            No messages yet — buyers can reach you from your vendor profile.
          </p>
        )}

        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="border border-line rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-ink">
                  {msg.profiles?.full_name ?? 'A buyer'}
                </span>
                <span className="text-xs text-ink/40">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-ink/70">{msg.message}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
