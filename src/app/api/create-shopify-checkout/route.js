import { shopifyApi } from "@shopify/shopify-api";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper to calculate order total consistently
function calculateOrderTotal(cart) {
  return cart.reduce((total, item) => {
    if (!item.price || !item.quantity) {
      throw new Error("Invalid cart item");
    }
    return total + item.price * item.quantity;
  }, 0);
}

export async function POST(req) {
  try {
    const requestData = await req.json();
    
    // Validate input
    const requiredFields = [
      'razorpayPaymentId',
      'razorpayOrderId', 
      'razorpaySignature',
      'cart',
      'email',
      'shippingAddress'
    ];
    
    for (const field of requiredFields) {
      if (!requestData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      cart,
      email,
      shippingAddress
    } = requestData;

    // Verify payment signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      throw new Error("Payment verification failed: Invalid signature");
    }

    // Initialize Shopify
    const shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      hostName: process.env.SHOPIFY_STORE_URL,
      apiVersion: "2024-01",
      isEmbeddedApp: false,
    });

    const client = new shopify.clients.Rest({
      session: {
        shop: process.env.SHOPIFY_STORE_URL,
        accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
    });

    // Prepare order data
    const orderTotal = calculateOrderTotal(cart);
    const orderData = {
      order: {
        email,
        financial_status: "paid",
        line_items: cart.map(item => ({
          variant_id: item.id,
          quantity: item.quantity,
          price: item.price // Important for auditing
        })),
        shipping_address: {
          first_name: shippingAddress.firstName,
          last_name: shippingAddress.lastName,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2 || "",
          city: shippingAddress.city,
          country: shippingAddress.country,
          zip: shippingAddress.zip,
          province: shippingAddress.province || "",
          phone: shippingAddress.phone || "",
        },
        transactions: [
          {
            kind: "sale",
            status: "success",
            amount: orderTotal,
            gateway: "Razorpay",
            gateway_reference: razorpayPaymentId,
          }
        ],
        note: `Razorpay Order ID: ${razorpayOrderId}`,
      }
    };

    // Create Shopify order
    const response = await client.post({
      path: "/orders.json",
      data: orderData,
      type: "application/json",
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        orderId: response.body.order.id,
        orderNumber: response.body.order.name 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error(`Order processing failed: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Order processing failed",
        code: error.code 
      }),
      {
        status: error.message.includes("Missing") ? 400 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}