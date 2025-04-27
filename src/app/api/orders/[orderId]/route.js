import { getShopifyOrder } from "@/lib/shopify";

export async function GET(request, { params }) {
  try {
    const { orderId } = await params; // Removed await since params is not a Promise

    if (!orderId || !/^\d+$/.test(orderId)) {
      return new Response(
        JSON.stringify({ error: "Invalid order ID format" }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const order = await getShopifyOrder(orderId);

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const orderDetails = {
      orderId: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      email: order.email,
      total: parseFloat(order.total_price),
      items: order.line_items.map(item => ({
        id: item.id,
        name: item.title,
        variant: item.variant_title || '',
        quantity: item.quantity,
        price: parseFloat(item.price),
        image: item.image?.src || null
      })),
      // Use customer-facing order status URL with invoice view parameter
      invoiceUrl: order.order_status_url ? `${order.order_status_url}&view=invoice` : null,
      shippingAddress: {
        firstName: order.shipping_address?.first_name || order.billing_address?.first_name || '',
        lastName: order.shipping_address?.last_name || order.billing_address?.last_name || '',
        address1: order.shipping_address?.address1 || order.billing_address?.address1 || '',
        address2: order.shipping_address?.address2 || order.billing_address?.address2 || '',
        city: order.shipping_address?.city || order.billing_address?.city || '',
        province: order.shipping_address?.province || order.billing_address?.province || '',
        country: order.shipping_address?.country || order.billing_address?.country || '',
        zip: order.shipping_address?.zip || order.billing_address?.zip || '',
        phone: order.shipping_address?.phone || order.billing_address?.phone || '',
        ...(!order.shipping_address && order.customer?.default_address ? {
          address1: order.customer.default_address.address1,
          address2: order.customer.default_address.address2,
          city: order.customer.default_address.city,
          province: order.customer.default_address.province,
          country: order.customer.default_address.country,
          zip: order.customer.default_address.zip,
          phone: order.customer.default_address.phone
        } : {})
      },
      shippingMethod: order.shipping_lines?.[0]?.title || 'Standard Shipping',
      paymentStatus: order.financial_status,
      paymentMethod: order.payment_gateway_names?.[0] || 'Not specified',
      trackingInfo: order.fulfillments?.[0]?.tracking_number ? {
        trackingId: order.fulfillments[0].tracking_number,
        trackingUrl: order.fulfillments[0].tracking_url,
        status: order.fulfillments[0].status
      } : null
    };

    return new Response(
      JSON.stringify(orderDetails),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Order fetch error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch order details',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}