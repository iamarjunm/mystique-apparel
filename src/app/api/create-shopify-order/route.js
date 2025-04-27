// /src/app/api/create-shopify-order/route.js
import { createShopifyOrder } from "@/lib/shopify";

export async function POST(req) {
  try {
    const body = await req.json();
    const { cart, email, shippingAddress, shippingOption, totalAmount } = body;

    // Validate required fields
    if (!cart || !email || !shippingAddress || !shippingOption || !totalAmount) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          required: ["cart", "email", "shippingAddress", "shippingOption", "totalAmount"]
        }), 
        { status: 400 }
      );
    }

    // Prepare line items
    const lineItems = cart.map(item => {
      if (!item.variantId || !item.quantity) {
        throw new Error("Each cart item must have variantId and quantity");
      }
      
      return {
        variantId: item.variantId,
        quantity: Number(item.quantity),
        ...(item.price && { price: Number(item.price) })
      };
    });

    // Prepare shipping lines
    const shippingLines = [{
      title: shippingOption.title,
      price: Number(totalAmount),
      code: shippingOption.code || 'standard',
      ...(shippingOption.carrierId && { carrier_identifier: shippingOption.carrierId })
    }];

    // Create the order payload
    const orderData = {
      email,
      lineItems,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || '',
        city: shippingAddress.city,
        province: shippingAddress.province,
        country: shippingAddress.country,
        zip: shippingAddress.zip,
        phone: shippingAddress.phone,
        countryCode: shippingAddress.countryCode || 'IN'
      },
      paymentStatus: 'paid',
      shippingLines,
      note: "Order created via API",
      tags: "api-created"
    };

    // Create the order using the shopify.js helper
    const order = await createShopifyOrder(orderData);

    // Successful response
    return new Response(
      JSON.stringify({ 
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        confirmationUrl: order.order_status_url
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Order Processing Error:", error);
    
    // Handle specific error cases
    let status = 500;
    let errorMessage = "Internal Server Error";
    
    if (error.message.includes("variantId") || error.message.includes("quantity")) {
      status = 400;
      errorMessage = error.message;
    } else if (error.message.includes("Shopify API Error")) {
      status = 502; // Bad Gateway
      errorMessage = "Shopify API request failed";
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }), 
      { 
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}