import { client } from '../../sanity'

/**
 * Create a new order in Sanity
 * @param {Object} orderData
 * @param {string} orderData.userId
 * @param {string} orderData.customerEmail
 * @param {string} orderData.customerName
 * @param {string} [orderData.customerPhone]
 * @param {Array<{productId: string, productTitle: string, variantSize?: string, variantColor?: string, quantity: number, price: number}>} orderData.items
 * @param {{street: string, city: string, state: string, postalCode: string, country: string}} orderData.shippingAddress
 * @param {number} orderData.subtotal
 * @param {number} orderData.shippingCost
 * @param {number} [orderData.tax]
 * @param {number} orderData.total
 * @param {'razorpay' | 'cod'} orderData.paymentMethod
 * @param {string} [orderData.paymentId]
 * @returns {Promise<Object>}
 */
export async function createOrder(orderData) {
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
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getUserOrders(userId) {
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
 * @param {string} orderNumber
 * @returns {Promise<Object>}
 */
export async function getOrder(orderNumber) {
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
 * @param {string} orderId
 * @param {'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'} status
 * @returns {Promise<Object>}
 */
export async function updateOrderStatus(
  orderId,
  status
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
 * @param {string} orderId
 * @param {string} trackingNumber
 * @returns {Promise<Object>}
 */
export async function addTrackingNumber(orderId, trackingNumber) {
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
 * @param {string} productId
 * @param {string} variantSize
 * @param {string} variantColor
 * @param {number} quantityToSubtract
 * @returns {Promise<boolean>}
 */
export async function updateProductStock(
  productId,
  variantSize,
  variantColor,
  quantityToSubtract
) {
  try {
    // Fetch current product
    const product = await client.getDocument(productId)
    
    if (!product || !product.variants) {
      throw new Error('Product or variants not found')
    }

    // Find and update the specific variant
    const updatedVariants = product.variants.map((variant) => {
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
