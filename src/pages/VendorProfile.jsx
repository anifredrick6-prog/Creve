import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Logo from '../components/Logo.jsx'

function VendorProfile() {
  const { vendorId } = useParams()
  const { session } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    async function load() {
      setLoadingData(true)
      const [{ data: vendorData }, { data: productData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, department, level, verified')
          .eq('id', vendorId)
          .single(),
        supabase
          .from('products')
          .select('*')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false }),
      ])
      setVendor(vendorData)
      setProducts(productData ?? [])
      setLoadingData(false)
    }
    load()
  }, [vendorId])

  return (
    <div className="min-h-screen bg-paper text-ink font-body">
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo color="#F04E37" size={24} />
            <span className="font-display text-2xl font-bold text-ink">Creve</span>
          </Link>
          <Link to="/marketplace" className="text-sm font-semibold text-ink/70 hover:text-ink">
            Back to marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">
        {loadingData && <p className="text-sm text-ink/50">Loading…</p>}

        {!loadingData && !vendor && (
          <p className="text-sm text-ink/50">Vendor not found.</p>
        )}

        {vendor && (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-coral-light flex items-center justify-center font-display font-bold text-coral text-lg shrink-0">
                {vendor.full_name?.[0] ?? '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-xl text-ink">
                    {vendor.full_name}
                  </h1>
                  {vendor.verified ? (
                    <span className="text-xs font-semibold text-coral bg-coral-light px-2.5 py-1 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber bg-amber/10 px-2.5 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink/50">
                  {vendor.department} &middot; {vendor.level} level
                </p>
              </div>
            </div>

            {session && session.user.id === vendorId ? null : (
              <div className="mb-10">
                {session ? (
                  <Link
                    to={`/messages/${vendorId}`}
                    className="block text-center font-bold text-sm px-6 py-3.5 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors"
                  >
                    Message this vendor
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
              </div>
            )}

            <h2 className="font-display font-bold text-lg text-ink mb-4">
              {products.length} listing{products.length === 1 ? '' : 's'}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-line rounded-2xl bg-white overflow-hidden"
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
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default VendorProfile
