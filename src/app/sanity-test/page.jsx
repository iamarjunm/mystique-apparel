'use client'

import { useEffect, useState } from 'react'
import { client } from '../../../sanity'

export default function SanityDiagnostics() {
  const [results, setResults] = useState({
    connection: null,
    products: null,
    categories: null,
    collections: null,
    orders: null,
    users: null,
    images: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    runDiagnostics()
  }, [])

  async function runDiagnostics() {
    console.log('🔍 [DIAGNOSTICS] Starting browser-side diagnostics...')
    setLoading(true)
    setError(null)

    try {
      // Test connection
      console.log('🔌 [DIAGNOSTICS] Testing connection...')
      const connectionTest = await client.fetch('*[0...1]{_id, _type}')
      setResults(prev => ({ ...prev, connection: { success: true, sample: connectionTest[0] } }))
      console.log('✅ [DIAGNOSTICS] Connection successful')

      // Test products
      console.log('🛍️  [DIAGNOSTICS] Fetching products...')
      const products = await client.fetch(`
        *[_type == "product"][0...5]{
          _id,
          title,
          slug,
          price,
          compareAtPrice,
          "mainImageUrl": mainImage.asset->url,
          "variantsCount": count(variants)
        }
      `)
      setResults(prev => ({ ...prev, products }))
      console.log('✅ [DIAGNOSTICS] Products:', products.length)

      // Test categories
      console.log('🏷️  [DIAGNOSTICS] Fetching categories...')
      const categories = await client.fetch(`
        *[_type == "category"]{
          _id,
          title,
          slug,
          "productsCount": count(*[_type == "product" && references(^._id)])
        }
      `)
      setResults(prev => ({ ...prev, categories }))
      console.log('✅ [DIAGNOSTICS] Categories:', categories.length)

      // Test collections
      console.log('📦 [DIAGNOSTICS] Fetching collections...')
      const collections = await client.fetch(`
        *[_type == "collection"]{
          _id,
          title,
          slug,
          "productsCount": count(products)
        }
      `)
      setResults(prev => ({ ...prev, collections }))
      console.log('✅ [DIAGNOSTICS] Collections:', collections.length)

      // Test orders
      console.log('📦 [DIAGNOSTICS] Fetching orders...')
      const orders = await client.fetch(`
        *[_type == "order"][0...5] | order(createdAt desc) {
          _id,
          orderNumber,
          customerEmail,
          status,
          total,
          "itemsCount": count(items)
        }
      `)
      setResults(prev => ({ ...prev, orders }))
      console.log('✅ [DIAGNOSTICS] Orders:', orders.length)

      // Test user profiles
      console.log('👤 [DIAGNOSTICS] Fetching user profiles...')
      const users = await client.fetch(`
        *[_type == "userProfile"][0...5]{
          _id,
          email,
          displayName,
          authProvider
        }
      `)
      setResults(prev => ({ ...prev, users }))
      console.log('✅ [DIAGNOSTICS] Users:', users.length)

      // Test image assets
      console.log('🖼️  [DIAGNOSTICS] Fetching image assets...')
      const images = await client.fetch(`
        *[_type == "sanity.imageAsset"][0...5]{
          _id,
          url,
          originalFilename
        }
      `)
      setResults(prev => ({ ...prev, images }))
      console.log('✅ [DIAGNOSTICS] Images:', images.length)

      setLoading(false)
      console.log('✅ [DIAGNOSTICS] All tests completed!')
    } catch (err) {
      console.error('❌ [DIAGNOSTICS] Error:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Sanity Diagnostics</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <span className="ml-4 text-gray-600">Running diagnostics...</span>
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Check the browser console for detailed logs
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Sanity Diagnostics</h1>
          <div className="bg-red-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">❌ Error</h2>
            <pre className="text-red-600 whitespace-pre-wrap">{error}</pre>
            <button
              onClick={runDiagnostics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Sanity Diagnostics</h1>
          <button
            onClick={runDiagnostics}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* Connection */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">🔌 Connection</h2>
          </div>
          <div className="p-6">
            {results.connection?.success ? (
              <div>
                <p className="text-green-600 font-semibold mb-2">✅ Connected</p>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(results.connection.sample, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-red-600">❌ Not connected</p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">🛍️ Products ({results.products?.length || 0})</h2>
          </div>
          <div className="p-6">
            {results.products && results.products.length > 0 ? (
              <div className="space-y-4">
                {results.products.map((p) => (
                  <div key={p._id} className="border-b pb-4 last:border-0">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-gray-600">
                      Slug: {p.slug?.current || p.slug} | Price: ₹{p.price}
                      {p.compareAtPrice && ` (was ₹${p.compareAtPrice})`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Variants: {p.variantsCount || 0} | Image: {p.mainImageUrl ? '✅' : '❌'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-yellow-600">⚠️ No products found. Add products in Sanity Studio.</p>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">🏷️ Categories ({results.categories?.length || 0})</h2>
          </div>
          <div className="p-6">
            {results.categories && results.categories.length > 0 ? (
              <div className="space-y-2">
                {results.categories.map((c) => (
                  <div key={c._id}>
                    <span className="font-semibold">{c.title}</span>
                    <span className="text-gray-600 text-sm ml-2">
                      ({c.slug?.current || c.slug}) - {c.productsCount} products
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No categories found</p>
            )}
          </div>
        </div>

        {/* Collections */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">📦 Collections ({results.collections?.length || 0})</h2>
          </div>
          <div className="p-6">
            {results.collections && results.collections.length > 0 ? (
              <div className="space-y-2">
                {results.collections.map((c) => (
                  <div key={c._id}>
                    <span className="font-semibold">{c.title}</span>
                    <span className="text-gray-600 text-sm ml-2">
                      ({c.slug?.current || c.slug}) - {c.productsCount} products
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No collections found</p>
            )}
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">📦 Orders ({results.orders?.length || 0})</h2>
          </div>
          <div className="p-6">
            {results.orders && results.orders.length > 0 ? (
              <div className="space-y-4">
                {results.orders.map((o) => (
                  <div key={o._id} className="border-b pb-4 last:border-0">
                    <p className="font-semibold">Order #{o.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {o.customerEmail} | Status: {o.status} | Total: ₹{o.total}
                    </p>
                    <p className="text-xs text-gray-500">Items: {o.itemsCount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No orders yet</p>
            )}
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">👤 User Profiles ({results.users?.length || 0})</h2>
          </div>
          <div className="p-6">
            {results.users && results.users.length > 0 ? (
              <div className="space-y-2">
                {results.users.map((u) => (
                  <div key={u._id}>
                    <span className="font-semibold">{u.displayName}</span>
                    <span className="text-gray-600 text-sm ml-2">
                      {u.email} ({u.authProvider})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No user profiles synced yet</p>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">🖼️ Image Assets ({results.images?.length || 0})</h2>
          </div>
          <div className="p-6">
            {results.images && results.images.length > 0 ? (
              <div className="grid grid-cols-5 gap-4">
                {results.images.map((img) => (
                  <div key={img._id} className="space-y-1">
                    <img
                      src={img.url}
                      alt={img.originalFilename}
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="text-xs text-gray-600 truncate">
                      {img.originalFilename}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-yellow-600">⚠️ No images found. Upload images in Sanity Studio.</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold mb-2">📝 Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Check the browser console for detailed logs</li>
            <li>Add products in Sanity Studio if missing</li>
            <li>Upload product images</li>
            <li>Test product pages at /shop</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
