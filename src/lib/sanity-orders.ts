import { client } from '@/sanity/lib/client'

/**
 * Create a new order in Sanity
 */
export async function createOrder(orderData: {
  userId: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  items: Array<{
    productId: string
    productTitle: string
    variantSize?: string
    variantColor?: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  subtotal: number
  shippingCost: number
  tax?: number
  total: number
  paymentMethod: 'razorpay' | 'cod'
  paymentId?: string
}) {
  try {
    // Generate order number
    const orderNumber = `MST-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Map items to include product references
    const items = orderData.items.map((item) => ({
      _type: 'object',
      product: {
        _type: 'reference',
        _ref: item.productId,
      },
      productTitle: item.productTitle,
      variantSize: item.variantSize,
      variantColor: item.variantColor,
      quantity: item.quantity,
      price: item.price,
    }))

    // Create order document
    const order = await client.create({
      _type: 'order',
      orderNumber,
      userId: orderData.userId,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone || null,
      items,
      shippingAddress: orderData.shippingAddress,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      tax: orderData.tax || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      paymentId: orderData.paymentId || null,
      status: orderData.paymentMethod === 'cod' ? 'pending' : 'processing',
      createdAt: new Date().toISOString(),
    })

    return order
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

/**
 * Get orders for a specific user
 */
export async function getUserOrders(userId: string) {
  try {
    const query = `*[_type == "order" && userId == $userId] | order(createdAt desc) {
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
    }`

    const orders = await client.fetch(query, { userId })
    return orders
  } catch (error) {
    console.error('Error fetching user orders:', error)
    throw error
  }
}

/**
 * Get order by order number
 */
export async function getOrder(orderNumber: string) {
  try {
    const query = `*[_type == "order" && orderNumber == $orderNumber][0] {
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
    }`

    const order = await client.fetch(query, { orderNumber })
    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
) {
  try {
    const order = await client
      .patch(orderId)
      .set({ status })
      .commit()

    return order
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

/**
 * Add tracking number to order
 */
export async function addTrackingNumber(orderId: string, trackingNumber: string) {
  try {
    const order = await client
      .patch(orderId)
      .set({ trackingNumber, status: 'shipped' })
      .commit()

    return order
  } catch (error) {
    console.error('Error adding tracking number:', error)
    throw error
  }
}

/**
 * Update product stock after order
 */
export async function updateProductStock(
  productId: string,
  variantSize: string,
  variantColor: string,
  quantityToSubtract: number
) {
  try {
    // Fetch current product
    const product = await client.getDocument(productId)
    
    if (!product || !product.variants) {
      throw new Error('Product or variants not found')
    }

    // Find and update the specific variant
    const updatedVariants = product.variants.map((variant: any) => {
      if (variant.size === variantSize && variant.color === variantColor) {
        return {
          ...variant,
          stock: Math.max(0, variant.stock - quantityToSubtract),
        }
      }
      return variant
    })

    // Update the product
    await client
      .patch(productId)
      .set({ variants: updatedVariants })
      .commit()

    return true
  } catch (error) {
    console.error('Error updating product stock:', error)
    throw error
  }
}
