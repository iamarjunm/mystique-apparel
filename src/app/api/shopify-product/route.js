// app/api/shopify-product/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  if (!productId) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    )
  }

  try {
    const cleanStoreUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')

    // Fetch product with variants
    const response = await fetch(
      `https://${cleanStoreUrl}/admin/api/2023-07/products/${productId}.json?fields=id,title,variants`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: 'Shopify API error', details: error },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Validate variants exist
    if (!data?.product?.variants?.length) {
      return NextResponse.json(
        { error: 'No variants found for product' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      product: data.product,
      variants: data.product.variants.map(v => ({
        id: v.id,
        sku: v.sku,
        title: v.title,
        inventory_item_id: v.inventory_item_id
      }))
    })
  } catch (error) {
    console.error('Shopify API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}