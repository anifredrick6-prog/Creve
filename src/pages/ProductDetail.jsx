import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Logo from '../components/Logo.jsx'
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Package,
  MessageCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

function ProductDetail() {
  const { productId } = useParams()
  const { session } = useAuth()
  const [product, setProduct] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})

  useEffect(() => {
    async function load() {
      setLoadingData(true)
      const { data } = await supabase
        .from('products')
        .select(
          'id, name, price, description, image_url, image_urls, stock_count, variants, vendor_id, profiles(full_name, department, level, verified)'
        )
        .eq('id', productId)
        .single()
      setProduct(data)
      setLoadingData(false)
    }
    load()
  }, [productId])

  if (loadingData) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm text-ink/50">Product not found.</p>
      </div>
    )
  }

  const images =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url
      ? [product.image_url]
      : []

  const vendor = product.profiles
  const isOwnProduct = session?.user.id === product.vendor_id

  function toggleOption(groupName, option) {
    setSelectedOptions((prev) => ({ ...prev, [groupName]: option }))
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-body">
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo color="#F04E37" size={24} />
            <span className="font-display text-2xl font-bold text-ink">Creve</span>
          </Link>
          <Link
            to="/marketplace"
            className="flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        {/* Image gallery */}
        <div className="mb-5">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-line">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs text-ink/35 font-semibold">No photo</span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                  aria-label="Next photo"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                    i === activeImage ? 'border-coral' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name, price, stock */}
        <h1 className="font-display font-bold text-2xl text-ink mb-1">{product.name}</h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl font-bold text-ink">
            ₦{Number(product.price).toLocaleString()}
          </span>
          {product.stock_count !== null && product.stock_count !== undefined && (
            <span className="flex items-center gap-1 text-xs font-semibold text-ink/50">
              <Package size={14} strokeWidth={2.5} />
              {product.stock_count > 0 ? `${product.stock_count} left` : 'Out of stock'}
            </span>
          )}
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-4 mb-6">
            {product.variants.map((group) => (
              <div key={group.name}>
                <p className="text-xs font-bold tracking-wide uppercase text-ink/50 mb-2">
                  {group.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleOption(group.name, option)}
                      className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                        selectedOptions[group.name] === option
                          ? 'bg-coral text-white border-coral'
                          : 'border-line text-ink/70 hover:border-coral/40'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-wide uppercase text-ink/50 mb-2">
            Description
          </p>
          <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-wrap">
            {product.description || 'No description provided.'}
          </p>
        </div>

        {/* Cart/buy placeholder — intentionally deferred */}
        <div className="flex items-center gap-2 text-xs text-ink/40 mb-8 border border-dashed border-line rounded-xl px-4 py-3">
          <ShoppingBag size={16} strokeWidth={2} />
          Cart and direct checkout are coming soon — message the vendor to arrange a purchase for now.
        </div>

        {/* Vendor card */}
        {vendor && (
          <Link
            to={`/vendor/${product.vendor_id}`}
            className="flex items-center gap-3 border border-line rounded-2xl p-4 bg-white mb-4 hover:border-coral/40 transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-coral-light flex items-center justify-center font-display font-bold text-coral shrink-0">
              {vendor.full_name?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-ink truncate">
                  {vendor.full_name}
                </span>
                {vendor.verified ? (
                  <BadgeCheck size={15} className="text-coral shrink-0" strokeWidth={2.5} />
                ) : (
                  <Clock size={14} className="text-amber shrink-0" strokeWidth={2.5} />
                )}
              </div>
              <p className="text-xs text-ink/50 truncate">
                {vendor.department} &middot; {vendor.level} level
              </p>
            </div>
          </Link>
        )}

        {/* Message CTA */}
        {!isOwnProduct && (
          <>
            {session ? (
              <Link
                to={`/messages/${product.vendor_id}`}
                className="flex items-center justify-center gap-2 font-bold text-sm px-6 py-3.5 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors"
              >
                <MessageCircle size={18} strokeWidth={2.5} />
                Message vendor about this
              </Link>
            ) : (
              <div className="border border-line rounded-2xl p-5 bg-white text-center">
                <p className="text-sm text-ink/60">
                  <Link to="/login" className="font-semibold text-coral">
                    Log in
                  </Link>{' '}
                  to message this vendor.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ProductDetail
