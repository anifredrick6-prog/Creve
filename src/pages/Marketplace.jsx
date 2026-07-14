import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import { useUnreadCount } from '../hooks/useUnreadCount.js'
import Logo from '../components/Logo.jsx'
import { MessageCircle, Store, Search, BadgeCheck, Package } from 'lucide-react'

function Marketplace() {
  const { session } = useAuth()
  const hasUnread = useUnreadCount(session)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoadingProducts(true)
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_url, stock_count, vendor_id, profiles(full_name, department, level, verified)')
        .order('created_at', { ascending: false })
      setProducts(data ?? [])
      setLoadingProducts(false)
    }
    load()
  }, [])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-paper text-ink font-body">
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
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
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              <Store size={16} strokeWidth={2.5} />
              Sell
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
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
        <p className="font-semibold text-sm text-ink truncate">{product.name}</p>
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
