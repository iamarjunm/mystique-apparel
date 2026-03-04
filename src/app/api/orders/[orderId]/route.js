import { NextResponse } from "next/server";
import { client } from "../../../../../sanity";

export async function GET(request, { params }) {
  console.log('📦 [ORDER DETAIL API] GET request received')
  try {
    const { orderId } = await params;
    console.log('📦 [ORDER DETAIL API] Order ID:', orderId)

    if (!orderId) {
      console.error('❌ [ORDER DETAIL API] Missing orderId parameter')
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    // Search by orderNumber (the human-readable order ID) not by Sanity _id
    const query = `*[_type == "order" && (orderNumber == $orderNumber || _id == $orderId)][0]{
      _id,
      orderNumber,
      customerEmail,
      customerName,
      customerPhone,
      items[]{
        _key,
        productTitle,
        variantSize,
        variantColor,
        quantity,
        price,
        "image": product->mainImage.asset->url
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
      createdAt
    }`

    console.log('🔍 [ORDER DETAIL API] Executing Sanity query for orderNumber:', orderId)
    const order = await client.fetch(query, { orderNumber: orderId, orderId })
    console.log('✅ [ORDER DETAIL API] Query result:', order ? {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      itemsCount: order.items?.length || 0
    } : 'NOT FOUND')

    if (!order) {
      console.error('❌ [ORDER DETAIL API] Order not found')
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.log('🔄 [ORDER DETAIL API] Transforming order details...')
    const orderDetails = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      email: order.customerEmail,
      total: Number(order.total || 0),
      items: (order.items || []).map(item => ({
        id: item._key || item.productTitle,
        name: item.productTitle,
        variant: [item.variantSize, item.variantColor].filter(Boolean).join(' / '),
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        image: item.image || null,
      })),
      shippingAddress: {
        firstName: order.customerName?.split(' ')?.[0] || '',
        lastName: order.customerName?.split(' ')?.slice(1).join(' ') || '',
        address1: order.shippingAddress?.street || '',
        address2: '',
        city: order.shippingAddress?.city || '',
        province: order.shippingAddress?.state || '',
        country: order.shippingAddress?.country || '',
        zip: order.shippingAddress?.postalCode || '',
        phone: order.customerPhone || '',
      },
      shippingMethod: order.shippingCost > 0 ? 'Standard Shipping' : 'No Shipping',
      paymentStatus: order.status,
      paymentMethod: order.paymentMethod,
      trackingInfo: order.trackingNumber ? {
        trackingId: order.trackingNumber,
        trackingUrl: null,
        status: order.status,
      } : null,
    }

    console.log('✅ [ORDER DETAIL API] Returning order details')
    return NextResponse.json(orderDetails)
  } catch (error) {
    console.error('❌ [ORDER DETAIL API] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}