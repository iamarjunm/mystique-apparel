import { defineQuery } from 'next-sanity'

// Product Queries
export const PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && defined(slug.current)] 
  | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    mainImage {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    },
    price,
    compareAtPrice,
    featured,
    newArrival,
    bestseller,
    categories[]->{
      _id,
      title,
      "slug": slug.current
    }
  }
`)

export const PRODUCT_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    mainImage {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    },
    gallery[] {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    },
    description,
    price,
    compareAtPrice,
    categories[]->{
      _id,
      title,
      "slug": slug.current
    },
    variants,
    weight,
    material,
    careInstructions,
    seo
  }
`)

export const FEATURED_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && featured == true] 
  | order(_createdAt desc) [0...8] {
    _id,
    title,
    "slug": slug.current,
    mainImage {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    },
    price,
    compareAtPrice
  }
`)

export const NEW_ARRIVALS_QUERY = defineQuery(`
  *[_type == "product" && newArrival == true] 
  | order(_createdAt desc) [0...8] {
    _id,
    title,
    "slug": slug.current,
    mainImage {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    },
    price,
    compareAtPrice
  }
`)

// Category Queries
export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category" && !defined(parentCategory)] 
  | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    image {
      asset->{
        _id,
        url
      },
      alt
    }
  }
`)

export const CATEGORY_QUERY = defineQuery(`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    image {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    }
  }
`)

export const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "product" && $categoryId in categories[]._ref] {
    _id,
    title,
    "slug": slug.current,
    mainImage {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    },
    price,
    compareAtPrice
  }
`)

// Collection Queries
export const COLLECTIONS_QUERY = defineQuery(`
  *[_type == "collection"] 
  | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    image {
      asset->{
        _id,
        url
      },
      alt
    },
    featured
  }
`)

export const COLLECTION_QUERY = defineQuery(`
  *[_type == "collection" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    image {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    },
    products[]->{
      _id,
      title,
      "slug": slug.current,
      mainImage {
        asset->{
          _id,
          url,
          metadata {
            lqip,
            dimensions { width, height }
          }
        },
        alt
      },
      price,
      compareAtPrice
    }
  }
`)

// Banner Queries
export const BANNERS_QUERY = defineQuery(`
  *[_type == "banner" && isActive == true] 
  | order(order asc) {
    _id,
    title,
    subtitle,
    image {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    },
    mobileImage {
      asset->{
        _id,
        url
      },
      alt
    },
    buttonText,
    buttonLink
  }
`)

// Site Settings Query
export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    siteName,
    tagline,
    logo {
      asset->{
        _id,
        url
      },
      alt
    },
    favicon {
      asset->{
        _id,
        url
      }
    },
    contactEmail,
    contactPhone,
    address,
    socialMedia,
    seo,
    shippingSettings,
    announcementBar
  }
`)

// Order Queries
export const USER_ORDERS_QUERY = defineQuery(`
  *[_type == "order" && userId == $userId] 
  | order(createdAt desc) {
    _id,
    orderNumber,
    items[]{
      productTitle,
      variantSize,
      variantColor,
      quantity,
      price
    },
    total,
    status,
    createdAt,
    trackingNumber
  }
`)

export const ORDER_QUERY = defineQuery(`
  *[_type == "order" && orderNumber == $orderNumber][0] {
    _id,
    orderNumber,
    userId,
    customerEmail,
    customerName,
    customerPhone,
    items[]{
      product->{
        _id,
        title,
        "slug": slug.current,
        mainImage {
          asset->{
            _id,
            url
          },
          alt
        }
      },
      productTitle,
      variantSize,
      variantColor,
      quantity,
      price
    },
    shippingAddress,
    subtotal,
    shippingCost,
    tax,
    total,
    paymentMethod,
    paymentId,
    status,
    trackingNumber,
    notes,
    createdAt
  }
`)
