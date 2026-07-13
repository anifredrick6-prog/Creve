import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import Logo from '../components/Logo.jsx'

function Marketplace() {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoadingProducts(true)
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_url, vendor_id, profiles(full_name, department, level, verified)')
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
            <Link to="/messages" className="text-sm font-semibold text-ink/70 hover:text-ink">
              Messages
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-ink/70 hover:text-ink"
            >
              Sell
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-5">
          Browse the marketplace
        </h1>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-full border border-line bg-white px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-coral outline-none transition-colors mb-8"
        />

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

  return (
    <Link
      to={`/vendor/${product.vendor_id}`}
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
          {vendor?.verified && <VerifiedDot />}
        </div>
      </div>
    </Link>
  )
}

function VerifiedDot() {
  return (
    <span
      className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-coral shrink-0"
      aria-label="Verified vendor"
    >
      <svg viewBox="0 0 12 12" className="w-1.5 h-1.5" fill="none">
        <path
          d="M2.5 6.2L4.8 8.5L9.5 3.5"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default Marketplace
