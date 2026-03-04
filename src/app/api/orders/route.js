import { NextResponse } from "next/server";
import { client } from "../../../../sanity";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const query = `*[_type == "order" && customerEmail == $email] | order(createdAt desc) {
      _id,
      orderNumber,
      items[]{
        _key,
        productTitle,
        quantity,
        price,
        "image": product->mainImage.asset->url
      },
      total,
      status,
      createdAt
    }`

    console.log('🔍 [ORDERS API] Executing Sanity query for email:', email)
    const orders = await client.fetch(query, { email })
    console.log('✅ [ORDERS API] Query result:', {
      count: orders?.length || 0,
      orders: orders?.map(o => ({ id: o._id, orderNumber: o.orderNumber, status: o.status })) || []
    })

    console.log('🔄 [ORDERS API] Transforming orders...')
    const transformedOrders = (orders || []).map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      total: Number(order.total || 0),
      status: order.status,
      lineItems: (order.items || []).map(item => ({
        id: item._key || item.productTitle,
        name: item.productTitle,
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        image: item.image || null,
      }))
    }))

    console.log('✅ [ORDERS API] Returning transformed orders:', transformedOrders.length)
    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error('❌ [ORDERS API] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}