// app/api/orders/route.js
import { getCustomerOrders } from "@/lib/shopify";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email parameter is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const orders = await getCustomerOrders(email);
    
    // Transform orders to match frontend needs
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      total: parseFloat(order.total_price),
      status: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      lineItems: order.line_items.map(item => ({
        id: item.id,
        name: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price),
        image: item.image?.src || null
      }))
    }));

    return new Response(
      JSON.stringify(transformedOrders),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Orders API error:', error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch orders" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}