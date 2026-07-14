import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Logo from '../components/Logo.jsx'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

function Cart() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)

  useEffect(() => {
    if (!loading && !session) navigate('/login')
  }, [loading, session, navigate])

  async function loadCart() {
    if (!session) return
    setLoadingItems(true)
    const { data } = await supabase
      .from('cart_items')
      .select('id, quantity, selected_variants, product_id, products(id, name, price, image_url, stock_count, vendor_id, profiles(full_name))')
      .eq('buyer_id', session.user.id)
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoadingItems(false)
  }

  useEffect(() => {
    loadCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return
    await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', itemId)
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
    )
  }

  async function removeItem(itemId) {
    await supabase.from('cart_items').delete().eq('id', itemId)
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const total = items.reduce(
    (sum, item) => sum + (item.products?.price ?? 0) * item.quantity,
    0
  )

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

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display font-bold text-2xl text-ink mb-6">Your cart</h1>

        {loadingItems && <p className="text-sm text-ink/50">Loading…</p>}

        {!loadingItems && items.length === 0 && (
          <div className="flex flex-col items-center text-center py-10">
            <ShoppingBag size={28} strokeWidth={1.5} className="text-ink/25 mb-2" />
            <p className="text-sm text-ink/50 mb-4">Your cart is empty.</p>
            <Link
              to="/marketplace"
              className="font-bold text-sm px-5 py-2.5 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors"
            >
              Browse the marketplace
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="space-y-3 mb-6">
              {items.map((item) => {
                const product = item.products
                if (!product) return null
                const variantEntries = Object.entries(item.selected_variants || {})

                return (
                  <div
                    key={item.id}
                    className="border border-line rounded-xl p-4 bg-white flex gap-4"
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
                      <Link
                        to={`/product/${product.id}`}
                        className="font-semibold text-sm text-ink truncate block hover:text-coral"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-ink/45 truncate">
                        {product.profiles?.full_name}
                      </p>
                      {variantEntries.length > 0 && (
                        <p className="text-xs text-ink/50 mt-0.5">
                          {variantEntries.map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </p>
                      )}
                      <p className="text-sm font-bold text-ink mt-1">
                        ₦{Number(product.price).toLocaleString()}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-line rounded-full">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-ink/60 hover:text-ink"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-ink/60 hover:text-ink"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-ink/35 hover:text-red-500"
                          aria-label="Remove from cart"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-line pt-4 flex items-center justify-between mb-6">
              <span className="font-semibold text-ink/70">Total</span>
              <span className="font-display font-bold text-xl text-ink">
                ₦{total.toLocaleString()}
              </span>
            </div>

            <button
              disabled
              className="w-full flex items-center justify-center gap-2 font-bold text-sm px-6 py-3.5 rounded-full bg-ink/10 text-ink/40 cursor-not-allowed"
              title="Checkout is coming very soon"
            >
              <ShoppingBag size={17} strokeWidth={2.5} />
              Checkout — coming very soon
            </button>
          </>
        )}
      </main>
    </div>
  )
}

export default Cart
