// src/lib/fetchProducts.js

import { client, urlFor } from '../../sanity'

const portableTextToPlain = (blocks) => {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .map((block) => Array.isArray(block.children)
      ? block.children.map((child) => child.text).join('')
      : '')
    .join('\n')
}

const mapProduct = (product) => {
  const price = Number(product.price || 0)
  const originalPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null
  const discountPercentage = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  const descriptionText = portableTextToPlain(product.description)

  const frontImage = product.mainImage?.asset?._ref
    ? urlFor(product.mainImage).width(800).height(1000).url()
    : product.mainImageUrl || null

  const backImage = product.gallery?.[0]?.asset?._ref
    ? urlFor(product.gallery[0]).width(800).height(1000).url()
    : product.gallery?.[0]?.asset?.url || null

  const mainImageUrl = product.mainImage?.asset?._ref
    ? urlFor(product.mainImage).width(800).height(1000).url()
    : product.mainImageUrl || null

  // Get all gallery images
  const galleryImages = product.gallery?.map(img => {
    if (img?.asset?._ref) {
      return urlFor(img).width(800).height(1000).url()
    }
    return img?.asset?.url || null
  }).filter(Boolean) || []

  const images = [mainImageUrl, ...galleryImages].filter(Boolean)

  // Extract unique colors from variants and map with stock info
  const variants = product.variants || []
  
  const availableColors = variants.map(v => v.color).filter(Boolean)
  
  // Calculate total stock from all color variants and all sizes
  const totalStock = variants.reduce((sum, variant) => {
    // Try both stock and sizeStock properties
    const variantStock = variant.stock || 0
    const sizeStock = variant.sizeStock || {}
    const sizeStockTotal = Object.values(sizeStock).reduce((s, stock) => s + (stock || 0), 0)
    return sum + (variantStock > 0 ? variantStock : sizeStockTotal)
  }, 0)

  // Use availableSizes from schema, fallback to all sizes if not defined
  const allSizeOptions = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl']
  const availableSizes = product.availableSizes && product.availableSizes.length > 0 
    ? product.availableSizes 
    : allSizeOptions

  return {
    id: product._id,
    slug: product.slug?.current || product.slug,
    title: product.title,
    description: descriptionText,
    price,
    originalPrice,
    discountPercentage,
    frontImage: frontImage || mainImageUrl,
    backImage: backImage || frontImage,
    images,
    featured: product.featured || false,
    newArrival: product.newArrival || false,
    bestseller: product.bestseller || false,
    totalStock,
    material: product.material || null,
    careInstructions: product.careInstructions || null,
    sizeGuide: product.sizeGuide || null,
    weight: product.weight || null,
    availableColors: availableColors,
    availableSizes: availableSizes,
    variants: variants.map((variant) => ({
      id: variant._key || `${product._id}-${variant.color?._id}`,
      color: {
        id: variant.color?._id,
        name: variant.color?.name,
        hexCode: variant.color?.hexCode,
        slug: variant.color?.slug?.current || variant.color?.slug,
      },
      sizeStock: variant.sizeStock || {
        xxs: 0,
        xs: 0,
        s: 0,
        m: 0,
        l: 0,
        xl: 0,
        xxl: 0,
      },
      priceAdjustment: variant.priceAdjustment || 0,
    })),
    sizes: availableSizes.map((size) => {
      // Calculate total stock for this size across all colors
      const sizeTotal = variants.reduce((sum, variant) => {
        const stock = variant.sizeStock?.[size] || 0
        return sum + stock
      }, 0)
      return {
        size,
        available: sizeTotal > 0,
        stock: sizeTotal,
      }
    }),
  }
}

export async function fetchProducts() {
  console.log('🛍️  [SANITY] fetchProducts called')
  const query = `*[_type == "product"]|order(_createdAt desc){
    _id,
    title,
    slug,
    price,
    compareAtPrice,
    mainImage,
    gallery,
    featured,
    newArrival,
    bestseller,
    material,
    careInstructions,
    sizeGuide,
    weight,
    availableSizes,
    variants[]{
      _key,
      color->{
        _id,
        name,
        hexCode,
        "slug": slug.current
      },
      sizeStock,
      priceAdjustment
    }
  }`

  console.log('🔍 [SANITY] Executing query:', query)
  const products = await client.fetch(query)
  console.log('✅ [SANITY] fetchProducts result:', {
    count: products?.length || 0,
    products: products?.map(p => ({ id: p._id, title: p.title })) || []
  })
  return Array.isArray(products) ? products.map(mapProduct) : []
}

export async function fetchProductById(slugOrId) {
  console.log('🛍️  [SANITY] fetchProductById called with:', slugOrId)
  const query = `*[_type == "product" && (slug.current == $slug || _id == $id)][0]{
    _id,
    title,
    slug,
    price,
    compareAtPrice,
    mainImage,
    gallery,
    description,
    featured,
    newArrival,
    bestseller,
    material,
    careInstructions,
    sizeGuide,
    weight,
    availableSizes,
    variants[]{
      _key,
      color->{
        _id,
        name,
        hexCode,
        "slug": slug.current
      },
      sizeStock,
      priceAdjustment
    }
  }`

  console.log('🔍 [SANITY] Executing query with params:', { slug: slugOrId, id: slugOrId })
  const product = await client.fetch(query, { slug: slugOrId, id: slugOrId })
  console.log('✅ [SANITY] fetchProductById result:', product ? {
    id: product._id,
    title: product.title,
    slug: product.slug,
    variantsCount: product.variants?.length || 0,
    availableSizes: product.availableSizes || []
  } : 'NOT FOUND')
  if (!product) return null
  return mapProduct(product)
}

export async function fetchCollectionByHandle(handle) {
  console.log('📦 [SANITY] fetchCollectionByHandle called with:', handle)
  const query = `*[_type == "collection" && slug.current == $handle][0]{
    _id,
    title,
    slug,
    products[]->{
      _id,
      title,
      slug,
      price,
      compareAtPrice,
      mainImage,
      gallery,
      "galleryUrls": gallery[].asset->url,
      featured,
      newArrival,
      bestseller,
      variants[]{
        _key,
        size,
        color->{
          _id,
          name,
          hexCode,
          slug
        },
        sku,
        stock,
        priceAdjustment
      }
    }
  }`

  console.log('🔍 [SANITY] Executing query with handle:', handle)
  const collection = await client.fetch(query, { handle })
  console.log('✅ [SANITY] fetchCollectionByHandle result:', collection ? {
    id: collection._id,
    title: collection.title,
    productsCount: collection.products?.length || 0
  } : 'NOT FOUND')
  if (!collection) return null

  return {
    collection: {
      id: collection._id,
      title: collection.title,
      handle: collection.slug?.current || collection.slug,
    },
    products: (collection.products || []).map(mapProduct),
  }
}

export async function fetchProductsByCategory(categoryHandle) {
  console.log('🏷️  [SANITY] fetchProductsByCategory called with:', categoryHandle)
  const query = `*[_type == "category" && slug.current == $handle][0]{
    _id,
    title,
    slug,
    "products": *[_type == "product" && references(^._id)]{
      _id,
      title,
      slug,
      price,
      compareAtPrice,
      mainImage,
      gallery,
      "galleryUrls": gallery[].asset->url,
      featured,
      newArrival,
      bestseller,
      variants[]{
        _key,
        size,
        color->{
          _id,
          name,
          hexCode,
          slug
        },
        sku,
        stock,
        priceAdjustment
      }
    }
  }`

  console.log('🔍 [SANITY] Executing query with handle:', categoryHandle)
  const category = await client.fetch(query, { handle: categoryHandle })
  console.log('✅ [SANITY] fetchProductsByCategory result:', category ? {
    id: category._id,
    title: category.title,
    productsCount: category.products?.length || 0
  } : 'NOT FOUND')
  if (!category) return null

  return {
    collection: {
      id: category._id,
      title: category.title,
      handle: category.slug?.current || category.slug,
    },
    products: (category.products || []).map(mapProduct),
  }
}
