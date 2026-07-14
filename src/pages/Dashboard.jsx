import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import { useUnreadCount } from '../hooks/useUnreadCount.js'
import Logo from '../components/Logo.jsx'
import FormField from '../components/FormField.jsx'
import {
  MessageCircle,
  Store,
  LogOut,
  BadgeCheck,
  Clock,
  ImagePlus,
  X,
  PlusCircle,
  Trash2,
  Package,
  Eye,
} from 'lucide-react'

function Dashboard() {
  const { session, loading } = useAuth()
  const hasUnread = useUnreadCount(session)
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [stockCount, setStockCount] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [variantGroups, setVariantGroups] = useState([])
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

  function addImageFiles(fileList) {
    const newFiles = Array.from(fileList ?? [])
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 6))
  }

  function removeImageFile(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function addVariantGroup() {
    setVariantGroups((prev) => [...prev, { name: '', optionsText: '' }])
  }

  function updateVariantGroup(index, field, value) {
    setVariantGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    )
  }

  function removeVariantGroup(index) {
    setVariantGroups((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleAddProduct(e) {
    e.preventDefault()
    setError('')

    if (!name || !price) {
      setError('Name and price are required.')
      return
    }

    setSubmitting(true)

    const uploadedUrls = []

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop()
      const filePath = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`)
        setSubmitting(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrlData.publicUrl)
    }

    const cleanVariants = variantGroups
      .filter((g) => g.name.trim() && g.optionsText.trim())
      .map((g) => ({
        name: g.name.trim(),
        options: g.optionsText
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean),
      }))

    const { error: insertError } = await supabase.from('products').insert({
      vendor_id: session.user.id,
      name,
      price: parseFloat(price),
      description,
      image_url: uploadedUrls[0] ?? null,
      image_urls: uploadedUrls,
      stock_count: stockCount === '' ? null : parseInt(stockCount, 10),
      variants: cleanVariants,
    })

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setName('')
    setPrice('')
    setDescription('')
    setStockCount('')
    setImageFiles([])
    setVariantGroups([])
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
            <Link
              to="/messages"
              className="relative flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              <MessageCircle size={16} strokeWidth={2.5} />
              Messages
              {hasUnread && (
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-coral" aria-label="Unread messages" />
              )}
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              <Store size={16} strokeWidth={2.5} />
              Marketplace
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              <LogOut size={16} strokeWidth={2.5} />
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
            <span className="flex items-center gap-1 text-xs font-semibold text-coral bg-coral-light px-2.5 py-1 rounded-full">
              <BadgeCheck size={13} strokeWidth={2.5} />
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber bg-amber/10 px-2.5 py-1 rounded-full">
              <Clock size={13} strokeWidth={2.5} />
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
            <span className="text-sm font-semibold text-ink/80 flex items-center gap-1.5">
              <Package size={15} strokeWidth={2.5} className="text-ink/50" />
              In stock (optional)
            </span>
            <input
              type="number"
              min="0"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              placeholder="Leave blank if you're not tracking stock"
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-coral outline-none transition-colors"
            />
          </label>

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

          {/* Variants */}
          <div>
            <span className="text-sm font-semibold text-ink/80">
              Variations (optional)
            </span>
            <p className="text-xs text-ink/45 mb-2">
              e.g. Size: S, M, L &nbsp;or&nbsp; Color: Black, White
            </p>
            <div className="space-y-2">
              {variantGroups.map((group, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => updateVariantGroup(i, 'name', e.target.value)}
                    placeholder="Size"
                    className="w-24 shrink-0 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-coral outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={group.optionsText}
                    onChange={(e) => updateVariantGroup(i, 'optionsText', e.target.value)}
                    placeholder="S, M, L"
                    className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-coral outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariantGroup(i)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center text-ink/40 hover:text-red-500"
                    aria-label="Remove variation"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariantGroup}
              className="mt-2 flex items-center gap-1.5 text-xs font-bold text-coral"
            >
              <PlusCircle size={15} strokeWidth={2.5} />
              Add a variation
            </button>
          </div>

          {/* Multi-image upload */}
          <div>
            <span className="text-sm font-semibold text-ink/80 flex items-center gap-1.5">
              <ImagePlus size={15} strokeWidth={2.5} className="text-ink/50" />
              Photos (up to 6)
            </span>
            <label className="mt-1.5 flex items-center justify-center gap-2 border border-dashed border-line rounded-lg py-3 text-sm text-ink/60 cursor-pointer hover:border-coral/40 transition-colors">
              <ImagePlus size={16} strokeWidth={2} />
              Choose photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => addImageFiles(e.target.files)}
                className="hidden"
              />
            </label>

            {imageFiles.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {imageFiles.map((file, i) => (
                  <div key={i} className="relative w-16 h-16 shrink-0">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink text-white flex items-center justify-center"
                      aria-label="Remove photo"
                    >
                      <X size={11} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              <Link
                to={`/product/${product.id}`}
                className="shrink-0 w-8 h-8 flex items-center justify-center text-ink/40 hover:text-ink"
                aria-label="View listing"
              >
                <Eye size={17} strokeWidth={2} />
              </Link>
              <button
                onClick={() => handleDelete(product.id)}
                className="shrink-0 w-8 h-8 flex items-center justify-center text-ink/40 hover:text-red-500"
                aria-label="Delete listing"
              >
                <Trash2 size={17} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
