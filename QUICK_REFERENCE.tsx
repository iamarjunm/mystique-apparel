// ============================================
// SANITY CMS - COMMON OPERATIONS GUIDE
// ============================================

// --------------------------------------------
// 1. FETCHING DATA (Server Components)
// --------------------------------------------

import { client } from '@/sanity/lib/client'
import { PRODUCTS_QUERY, PRODUCT_QUERY } from '@/sanity/lib/queries'

// Fetch all products
async function getAllProducts() {
  const products = await client.fetch(PRODUCTS_QUERY)
  return products
}

// Fetch single product by slug
async function getProduct(slug: string) {
  const product = await client.fetch(PRODUCT_QUERY, { slug })
  return product
}

// Custom GROQ query
async function customQuery() {
  const query = `*[_type == "product" && price < 1000]{
    _id,
    title,
    price,
    "slug": slug.current
  }`
  const cheapProducts = await client.fetch(query)
  return cheapProducts
}

// --------------------------------------------
// 2. IMAGES
// --------------------------------------------

import { SanityImage } from '@/components/SanityImage'
import { urlFor } from '@/sanity/lib/image'

// Using the SanityImage component (Recommended)
<SanityImage 
  value={product.mainImage}
  width={800}
  height={600}
  alt={product.title}
  priority={true}
/>

// Getting image URL manually
const imageUrl = urlFor(product.mainImage)
  .width(400)
  .height(300)
  .url()

// Gallery images
{product.gallery?.map((image, index) => (
  <SanityImage 
    key={index}
    value={image}
    width={600}
  />
))}

// --------------------------------------------
// 3. FIREBASE AUTHENTICATION
// --------------------------------------------

'use client'
import { useAuth } from '@/context/AuthContext'

function AuthComponent() {
  const { 
    user, 
    userData, 
    loading,
    signIn, 
    signUp, 
    signOut,
    resetPassword,
    updateUserProfile 
  } = useAuth()

  // Sign up new user
  const handleSignUp = async () => {
    try {
      await signUp('email@example.com', 'password123', 'John Doe')
      // User is automatically signed in after signup
    } catch (error) {
      console.error(error.message)
    }
  }

  // Sign in existing user
  const handleSignIn = async () => {
    try {
      await signIn('email@example.com', 'password123')
    } catch (error) {
      console.error(error.message)
    }
  }

  // Sign out
  const handleSignOut = async () => {
    await signOut()
  }

  // Reset password
  const handleResetPassword = async () => {
    try {
      await resetPassword('email@example.com')
      alert('Password reset email sent!')
    } catch (error) {
      console.error(error.message)
    }
  }

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile({
        displayName: 'New Name',
        phoneNumber: '+91 9876543210',
        addresses: [...userData.addresses, newAddress]
      })
    } catch (error) {
      console.error(error.message)
    }
  }

  // Check if user is logged in
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>

  return (
    <div>
      <p>Welcome, {userData?.displayName}!</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}

// --------------------------------------------
// 4. PROTECTED ROUTES
// --------------------------------------------

import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      {/* Only accessible to logged-in users */}
      <div>Protected content here</div>
    </ProtectedRoute>
  )
}

// --------------------------------------------
// 5. ORDER MANAGEMENT
// --------------------------------------------

import { 
  createOrder, 
  getUserOrders, 
  getOrder,
  updateProductStock 
} from '@/lib/sanity-orders'

// Create new order
async function handleCheckout(cartItems, userId, userEmail, userName) {
  const order = await createOrder({
    userId,
    customerEmail: userEmail,
    customerName: userName,
    customerPhone: '+91 9876543210',
    items: cartItems.map(item => ({
      productId: item._id,
      productTitle: item.title,
      variantSize: item.size,
      variantColor: item.color,
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
    },
    subtotal: 2000,
    shippingCost: 100,
    tax: 0,
    total: 2100,
    paymentMethod: 'razorpay',
    paymentId: 'pay_xxxxx',
  })

  // Update stock for each item
  for (const item of cartItems) {
    await updateProductStock(
      item._id,
      item.size,
      item.color,
      item.quantity
    )
  }

  return order
}

// Get user's orders
async function fetchUserOrders(userId: string) {
  const orders = await getUserOrders(userId)
  return orders
}

// Get single order
async function fetchOrder(orderNumber: string) {
  const order = await getOrder(orderNumber)
  return order
}

// --------------------------------------------
// 6. PRODUCT FILTERING & SEARCH
// --------------------------------------------

// Filter by category
const query = `*[_type == "product" && $categoryId in categories[]._ref]{
  _id,
  title,
  price,
  mainImage
}`
const products = await client.fetch(query, { categoryId: 'category-id-here' })

// Search products
const searchQuery = `*[_type == "product" && 
  (title match $searchTerm || 
   pt::text(description) match $searchTerm)
]{
  _id,
  title,
  price,
  mainImage
}`
const results = await client.fetch(searchQuery, { 
  searchTerm: 'shirt*' // Use * for wildcard
})

// Filter by price range
const priceQuery = `*[_type == "product" && 
  price >= $minPrice && 
  price <= $maxPrice
]{
  _id,
  title,
  price
}`
const products = await client.fetch(priceQuery, { 
  minPrice: 500, 
  maxPrice: 2000 
})

// Get featured products
const featuredQuery = `*[_type == "product" && featured == true][0...8]{
  _id,
  title,
  price,
  mainImage
}`
const featured = await client.fetch(featuredQuery)

// --------------------------------------------
// 7. CART MANAGEMENT WITH SANITY
// --------------------------------------------

'use client'
import { useState, useEffect } from 'react'

function useCart() {
  const [cart, setCart] = useState([])

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Add to cart
  const addToCart = (product, variant) => {
    setCart(prev => {
      const existing = prev.find(
        item => item._id === product._id && 
        item.size === variant.size && 
        item.color === variant.color
      )

      if (existing) {
        return prev.map(item =>
          item._id === product._id && 
          item.size === variant.size && 
          item.color === variant.color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prev, {
        _id: product._id,
        title: product.title,
        price: product.price,
        image: product.mainImage,
        size: variant.size,
        color: variant.color,
        quantity: 1,
      }]
    })
  }

  // Remove from cart
  const removeFromCart = (productId, size, color) => {
    setCart(prev => prev.filter(
      item => !(item._id === productId && 
               item.size === size && 
               item.color === color)
    ))
  }

  // Update quantity
  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color)
      return
    }
    
    setCart(prev => prev.map(item =>
      item._id === productId && 
      item.size === size && 
      item.color === color
        ? { ...item, quantity }
        : item
    ))
  }

  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return { cart, addToCart, removeFromCart, updateQuantity, total }
}

// --------------------------------------------
// 8. RAZORPAY INTEGRATION WITH SANITY
// --------------------------------------------

async function handlePayment(orderData) {
  // Load Razorpay script
  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  document.body.appendChild(script)

  await new Promise(resolve => {
    script.onload = resolve
  })

  // Initialize Razorpay
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: orderData.total * 100, // Amount in paise
    currency: 'INR',
    name: 'Mystique Apparel',
    description: 'Order Payment',
    handler: async function(response) {
      // Payment successful
      const razorpayPaymentId = response.razorpay_payment_id

      // Create order in Sanity
      const order = await createOrder({
        ...orderData,
        paymentId: razorpayPaymentId,
        paymentMethod: 'razorpay',
      })

      // Redirect to order confirmation
      window.location.href = `/order-confirmation/${order.orderNumber}`
    },
    prefill: {
      name: orderData.customerName,
      email: orderData.customerEmail,
      contact: orderData.customerPhone,
    },
    theme: {
      color: '#000000',
    },
  }

  const razorpay = new (window as any).Razorpay(options)
  razorpay.open()
}

// --------------------------------------------
// 9. USEFUL GROQ PATTERNS
// --------------------------------------------

// Get products with their categories
const query1 = `*[_type == "product"]{
  _id,
  title,
  categories[]->{
    _id,
    title,
    "slug": slug.current
  }
}`

// Get category with its products
const query2 = `*[_type == "category" && slug.current == $slug][0]{
  _id,
  title,
  "products": *[_type == "product" && references(^._id)]{
    _id,
    title,
    price
  }
}`

// Count products in each category
const query3 = `*[_type == "category"]{
  _id,
  title,
  "productCount": count(*[_type == "product" && references(^._id)])
}`

// Get related products (same categories)
const query4 = `*[_type == "product" && _id != $currentProductId && 
  count((categories[]._ref)[@ in $currentCategories]) > 0
][0...4]{
  _id,
  title,
  price,
  mainImage
}`

// Pagination
const query5 = `{
  "products": *[_type == "product"][($page * 20)...(($page + 1) * 20)]{
    _id,
    title,
    price
  },
  "total": count(*[_type == "product"])
}`

// --------------------------------------------
// 10. DEPLOYMENT CHECKLIST
// --------------------------------------------

/*
1. Deploy Sanity schemas:
   npx sanity@latest schema deploy

2. Add content in Sanity Studio:
   http://localhost:3000/studio

3. Environment variables (.env.local):
   - NEXT_PUBLIC_SANITY_PROJECT_ID
   - NEXT_PUBLIC_SANITY_DATASET
   - NEXT_PUBLIC_SANITY_TOKEN
   - NEXT_PUBLIC_RAZORPAY_KEY_ID
   - NEXT_PUBLIC_RAZORPAY_KEY_SECRET

4. Update existing pages to use Sanity queries

5. Test authentication flow

6. Test order creation and payment

7. Deploy to Vercel/production
*/
