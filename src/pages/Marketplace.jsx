import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import { useUnreadCount } from '../hooks/useUnreadCount.js'
import { useCartCount } from '../hooks/useCartCount.js'
import Logo from '../components/Logo.jsx'
import { MessageCircle, Store, Search, BadgeCheck, Package, ShoppingBag, Package2, Wrench } from 'lucide-react'

function Marketplace() {
  const { session } = useAuth()
  const hasUnread = useUnreadCount(session)
  const cartCount = useCartCount(session)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    async function load() {
      setLoadingProducts(true)
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_url, stock_count, listing_type, vendor_id, profiles(full_name, department, level, verified)')
        .order('created_at', { ascending: false })
      setProducts(data ?? [])
      setLoadingProducts(false)
    }
    load()
  }, [])

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => typeFilter === 'all' || p.listing_type === typeFilter)

  return (
    <div className="min-h-screen bg-paper text-ink font-body">
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo color="#F04E37" size={24} />
            <span className="font-display text-2xl font-bold text-ink hidden sm:inline">Creve</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/messages"
              className="relative flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              <MessageCircle size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Messages</span>
              {hasUnread && (
                <span className="absolute -top-1 -right-1.5 sm:-right-2 w-2 h-2 rounded-full bg-coral" aria-label="Unread messages" />
              )}
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              <Store size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Sell</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <StoriesRail />

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-5">
          Browse the marketplace
        </h1>

        <div className="relative mb-8">
          <Search
            size={17}
            strokeWidth={2.5}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-line bg-white pl-11 pr-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-coral outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'product', label: 'Products' },
            { key: 'service', label: 'Services' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                typeFilter === tab.key
                  ? 'bg-coral text-white border-coral'
                  : 'border-line text-ink/60 hover:border-coral/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadingProducts && <p className="text-sm text-ink/50">Loading…</p>}

        {!loadingProducts && filtered.length === 0 && (
          <p className="text-sm text-ink/50">
            {products.length === 0
              ? 'No products listed yet — check back soon.'
              : 'No products match your search.'}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  )
}

function StoriesRail() {
  const [vendors, setVendors] = useState([])
  const [loadingStories, setLoadingStories] = useState(true)

  useEffect(() => {
    async function load() {
      setLoadingStories(true)
      const { data } = await supabase
        .from('stories')
        .select('vendor_id, created_at, profiles(full_name, verified, avatar_url)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      const seen = new Map()
      for (const row of data ?? []) {
        if (!seen.has(row.vendor_id)) {
          seen.set(row.vendor_id, {
            vendorId: row.vendor_id,
            name: row.profiles?.full_name,
            verified: row.profiles?.verified,
            avatarUrl: row.profiles?.avatar_url,
          })
        }
      }

      setVendors(Array.from(seen.values()))
      setLoadingStories(false)
    }
    load()
  }, [])

  if (loadingStories || vendors.length === 0) return null

  return (
    <div className="flex gap-4 overflow-x-auto mb-6 pb-1">
      {vendors.map((v) => (
        <Link
          key={v.vendorId}
          to={`/stories/${v.vendorId}`}
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-coral to-amber">
            <div className="w-full h-full rounded-full border-2 border-paper overflow-hidden bg-white flex items-center justify-center">
              {v.avatarUrl ? (
                <img src={v.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-bold text-coral">{v.name?.[0] ?? '?'}</span>
              )}
            </div>
          </div>
          <span className="text-xs font-semibold text-ink/70 max-w-[64px] truncate">
            {v.name}
          </span>
        </Link>
      ))}
    </div>
  )
}

function ProductCard({ product }) {
  const vendor = product.profiles
  const outOfStock = product.stock_count !== null && product.stock_count === 0

  return (
    <Link
      to={`/product/${product.id}`}
      className="border border-line rounded-2xl bg-white overflow-hidden hover:border-coral/40 transition-colors"
    >
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-paper flex items-center justify-center">
          <span className="text-xs text-ink/35 font-semibold">No photo</span>
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-1 mb-0.5">
          {product.listing_type === 'service' ? (
            <Wrench size={11} strokeWidth={2.5} className="text-amber shrink-0" />
          ) : (
            <Package2 size={11} strokeWidth={2.5} className="text-ink/30 shrink-0" />
          )}
          <p className="font-semibold text-sm text-ink truncate">{product.name}</p>
        </div>
        <p className="text-sm font-bold text-ink mt-0.5">
          ₦{Number(product.price).toLocaleString()}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-xs text-ink/50 truncate">{vendor?.full_name}</span>
          {vendor?.verified && (
            <BadgeCheck size={13} className="text-coral shrink-0" strokeWidth={2.5} />
          )}
        </div>
        {outOfStock && (
          <div className="flex items-center gap-1 mt-1">
            <Package size={12} strokeWidth={2.5} className="text-ink/35" />
            <span className="text-xs text-ink/40">Out of stock</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default Marketplace
