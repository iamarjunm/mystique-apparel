# Mystique Apparel - Sanity & Firebase Integration Summary

## ✅ Completed Tasks

### 1. Sanity Schemas Created
All necessary schemas have been created in `/src/sanity/schemaTypes/`:

- **Product** (`product.ts`): Complete e-commerce product schema with:
  - Basic info (title, slug, description)
  - Images (main image + gallery with hotspot)
  - Pricing (price, compareAtPrice for discounts)
  - Categories (references to category documents)
  - Variants (size, color, SKU, stock)
  - Flags (featured, newArrival, bestseller)
  - Material, weight, care instructions
  - SEO fields

- **Category** (`category.ts`): Product categorization with:
  - Title, slug, description
  - Category image
  - Parent category support (for subcategories)
  - Display order

- **Collection** (`collection.ts`): Curated product collections
  - Title, slug, description
  - Collection image
  - Product references
  - Featured flag

- **Banner** (`banner.ts`): Homepage promotional banners
  - Title, subtitle
  - Desktop & mobile images
  - Button text & link
  - Display order & active status

- **Order** (`order.ts`): Complete order management
  - Order number & customer details
  - Order items with product references
  - Shipping address
  - Pricing breakdown (subtotal, shipping, tax, total)
  - Payment info (method, payment ID)
  - Order status tracking
  - Tracking number support

- **Site Settings** (`siteSettings.ts`): Global site configuration
  - Site name, tagline, logo, favicon
  - Contact information
  - Social media links
  - Default SEO settings
  - Shipping configuration
  - Announcement bar

### 2. Sanity Client & Utilities

**Files Created:**
- `/src/sanity/lib/client.ts` - Sanity client with token support
- `/src/sanity/lib/image.ts` - Image URL builder for optimized images
- `/src/sanity/lib/queries.ts` - Pre-built GROQ queries for:
  - Products (all, single, featured, new arrivals, by category)
  - Categories (all, single, products by category)
  - Collections (all, single with products)
  - Banners (active banners)
  - Site settings
  - Orders (user orders, single order)

**Helper Components:**
- `/src/components/SanityImage.tsx` - Reusable component for rendering Sanity images with Next.js Image optimization

### 3. Firebase Authentication

**Firebase Setup:**
- Updated `firebase.js` with proper initialization
- Added Auth, Firestore, and Analytics services
- Singleton pattern to prevent multiple initializations

**Auth Context:**
- `/src/context/AuthContext.tsx` - Complete authentication provider with:
  - User state management
  - Sign in, sign up, sign out functions
  - Password reset
  - Profile updates
  - User data from Firestore
  - Protected route support

**Helper Components:**
- `/src/components/ProtectedRoute.tsx` - Wrapper for protected pages

**User Data Structure in Firestore:**
```typescript
{
  uid: string
  email: string
  displayName: string
  phoneNumber: string | null
  photoURL: string | null
  addresses: Array<{
    id: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    isPrimary: boolean
  }>
  createdAt: string
}
```

### 4. Order Management

**File:** `/src/lib/sanity-orders.ts`

**Functions Available:**
- `createOrder()` - Create new orders in Sanity
- `getUserOrders()` - Fetch user's order history
- `getOrder()` - Get single order by order number
- `updateOrderStatus()` - Update order status
- `addTrackingNumber()` - Add tracking info
- `updateProductStock()` - Decrease stock after purchase

### 5. Shopify Removal

**Removed Files:**
- `/src/lib/shopify.js`
- `/src/lib/fetchProductWeight.js`
- `/src/app/api/shopify-product/`
- `/src/app/api/create-shopify-checkout/`
- `/src/app/api/create-shopify-order/`

**Updated Files:**
- `next.config.js` - Removed Shopify env vars, added Sanity CDN to allowed image domains

## 🚀 Next Steps

### 1. Deploy Schemas to Sanity
Run this command to deploy your schemas:
```bash
cd /Users/vedantmalhotra/Downloads/mystique-apparel
npx sanity@latest schema deploy
```

### 2. Access Sanity Studio
Your Sanity Studio is available at:
```
http://localhost:3000/studio
```

### 3. Update Existing Pages

You'll need to update your existing pages to use Sanity instead of Shopify:

**Example: Product Listing Page**
```typescript
import { client } from '@/sanity/lib/client'
import { PRODUCTS_QUERY } from '@/sanity/lib/queries'

export default async function ShopPage() {
  const products = await client.fetch(PRODUCTS_QUERY)
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}
```

**Example: Single Product Page**
```typescript
import { client } from '@/sanity/lib/client'
import { PRODUCT_QUERY } from '@/sanity/lib/queries'
import { SanityImage } from '@/components/SanityImage'

export default async function ProductPage({ params }) {
  const product = await client.fetch(PRODUCT_QUERY, { slug: params.slug })
  
  return (
    <div>
      <SanityImage value={product.mainImage} width={600} />
      <h1>{product.title}</h1>
      <p>₹{product.price}</p>
      {/* ... rest of product details */}
    </div>
  )
}
```

### 4. Protected Routes

Wrap protected pages with the ProtectedRoute component:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div>
        {/* Your protected content */}
      </div>
    </ProtectedRoute>
  )
}
```

### 5. Using Auth Context

```typescript
'use client'
import { useAuth } from '@/context/AuthContext'

export default function MyComponent() {
  const { user, userData, signIn, signOut } = useAuth()
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {userData?.displayName}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={() => signIn(email, password)}>Sign In</button>
      )}
    </div>
  )
}
```

### 6. Creating Orders

```typescript
import { createOrder } from '@/lib/sanity-orders'

const handleCheckout = async (cartItems, shippingAddress) => {
  const order = await createOrder({
    userId: user.uid,
    customerEmail: user.email,
    customerName: userData.displayName,
    items: cartItems.map(item => ({
      productId: item._id,
      productTitle: item.title,
      variantSize: item.selectedSize,
      variantColor: item.selectedColor,
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress,
    subtotal: calculateSubtotal(cartItems),
    shippingCost: 100,
    total: calculateTotal(cartItems),
    paymentMethod: 'razorpay',
    paymentId: razorpayPaymentId,
  })
  
  return order
}
```

## 📝 Environment Variables

Make sure you have all these in your `.env.local`:

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID="gukn7o5g"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_TOKEN="your-token-here"

# Firebase (already configured)
# No additional env vars needed - configured in firebase.js

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_8lxjmbn8PmGpQN
NEXT_PUBLIC_RAZORPAY_KEY_SECRET=s0jxTvEwjx0JbpDl5YMOSowk
```

## 🎨 Key Differences from Shopify

1. **Data Source**: Products now come from Sanity CMS instead of Shopify
2. **Images**: Use `SanityImage` component and `urlFor()` helper
3. **Queries**: Use GROQ queries instead of GraphQL
4. **Orders**: Orders are stored in Sanity (can sync with Shiprocket for fulfillment)
5. **Stock Management**: Update stock in Sanity after successful orders
6. **Authentication**: Using Firebase Auth instead of Shopify customer accounts

## 📚 Useful Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)

## 🐛 Common Issues & Solutions

### Issue: Images not loading
**Solution**: Make sure `cdn.sanity.io` is in `next.config.js` remotePatterns

### Issue: "useAuth must be used within AuthProvider"
**Solution**: Make sure `AuthProvider` wraps your app in `layout.jsx`

### Issue: Queries returning empty
**Solution**: 
1. Check if you've added content in Sanity Studio
2. Verify your GROQ query syntax
3. Make sure the document type matches your schema

### Issue: Firebase "app already exists"
**Solution**: Using the singleton pattern in `firebase.js` (already implemented)

## ✨ Ready to Use!

Your app is now configured with:
- ✅ Sanity CMS for content management
- ✅ Firebase Authentication for user management
- ✅ Complete e-commerce schemas
- ✅ Order management system
- ✅ Razorpay payment integration (existing)
- ✅ Image optimization

Start by deploying your schemas and adding some products in the Sanity Studio!
