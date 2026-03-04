import { client } from '../../../../sanity'

export async function POST(request) {
  try {
    const { code, cartTotal, cartItems } = await request.json()

    if (!code) {
      return Response.json({ valid: false, error: 'Discount code is required' }, { status: 400 })
    }

    const parsedCartTotal = Number(cartTotal)
    if (Number.isNaN(parsedCartTotal) || parsedCartTotal < 0) {
      return Response.json({ valid: false, error: 'Invalid cart total' }, { status: 400 })
    }

    // Query Sanity for the discount code
    const query = `*[_type == "discountCode" && code == $code && isActive == true][0]{
      _id,
      code,
      description,
      discountType,
      percentageOff,
      fixedAmountOff,
      minimumPurchaseAmount,
      maximumDiscountAmount,
      appliesTo,
      specificProducts[]->{_id, title},
      specificCategories[]->{_id, title},
      specificCollections[]->{_id, title},
      startDate,
      endDate,
      usageLimit,
      timesUsed,
      usageLimitPerCustomer
    }`

    const discount = await client.fetch(query, { code: code.toUpperCase() })

    if (!discount) {
      return Response.json({ valid: false, error: 'Invalid discount code' }, { status: 404 })
    }

    // Check if discount is active based on dates
    const now = new Date()
    if (discount.startDate && new Date(discount.startDate) > now) {
      return Response.json({ valid: false, error: 'This discount code is not yet active' }, { status: 400 })
    }
    if (discount.endDate && new Date(discount.endDate) < now) {
      return Response.json({ valid: false, error: 'This discount code has expired' }, { status: 400 })
    }

    // Check usage limit
    if (discount.usageLimit && discount.timesUsed >= discount.usageLimit) {
      return Response.json({ valid: false, error: 'This discount code has reached its usage limit' }, { status: 400 })
    }

    // Check minimum purchase amount
    if (discount.minimumPurchaseAmount && parsedCartTotal < discount.minimumPurchaseAmount) {
      return Response.json({ 
        valid: false,
        error: `Minimum purchase of ₹${discount.minimumPurchaseAmount} required` 
      }, { status: 400 })
    }

    // Calculate discount amount
    let discountAmount = 0

    switch (discount.discountType) {
      case 'percentage':
        discountAmount = (parsedCartTotal * (discount.percentageOff || 0)) / 100
        if (discount.maximumDiscountAmount) {
          discountAmount = Math.min(discountAmount, discount.maximumDiscountAmount)
        }
        break

      case 'fixed':
        discountAmount = discount.fixedAmountOff || 0
        break

      case 'freeShipping':
        discountAmount = 0 // Shipping discount handled separately
        break

      case 'buyXGetY':
        // Complex logic - would need cart item analysis
        // For now, return 0
        discountAmount = 0
        break

      default:
        discountAmount = 0
    }

    // Cap discount at cart total
    discountAmount = Math.min(discountAmount, parsedCartTotal)

    return Response.json({
      valid: true,
      discount: {
        code: discount.code,
        type: discount.discountType,
        amount: discountAmount,
        description: discount.description,
        freeShipping: discount.discountType === 'freeShipping'
      }
    })

  } catch (error) {
    console.error('Error validating discount code:', error)
    return Response.json({ valid: false, error: 'Failed to validate discount code' }, { status: 500 })
  }
}
