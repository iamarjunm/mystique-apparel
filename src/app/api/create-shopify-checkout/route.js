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
    if (typeof item.price !== "number" || typeof item.quantity !== "number") {
      throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
    }
    return total + (item.price * item.quantity);
  }, 0);
}

// Validate shipping address structure
function validateShippingAddress(address) {
  const requiredFields = [
    'firstName', 'lastName', 'address1', 
    'city', 'country', 'zip', 'phone'
  ];
  
  for (const field of requiredFields) {
    if (!address[field]) {
      throw new Error(`Missing shipping address field: ${field}`);
    }
  }
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
      shippingAddress,
      shippingOption // Optional shipping option
    } = requestData;

    // Verify payment signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      throw new Error("Payment verification failed: Invalid signature");
    }

    console.log(hmac);

    // Validate shipping address
    validateShippingAddress(shippingAddress);
    const hostname = process.env.SHOPIFY_STORE_URL.replace(/^https?:\/\//, ''); 

    // Initialize Shopify
    const shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      hostName: hostname,
      apiVersion: "2024-01",
      isEmbeddedApp: false,
    });

    const client = new shopify.rest.RestClient({
      session: {
        shop: hostname,
        accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
    });
    

    // Calculate order total
    const orderTotal = calculateOrderTotal(cart);
    
    // Prepare base order data
    const orderData = {
      order: {
        email,
        financial_status: "paid",
        line_items: cart.map(item => ({
          variant_id: item.variantId, // Changed from item.id to item.variantId
          quantity: item.quantity,
          price: item.price,
          name: item.title // Added product title
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
          phone: shippingAddress.phone,
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

    // Add shipping line if shipping option provided
    if (shippingOption) {
      orderData.order.shipping_lines = [{
        title: shippingOption.title,
        price: parseFloat(shippingOption.price.toString().replace(/[^\d.]/g, '')),
        code: shippingOption.id
      }];
      
      // Add shipping method to order notes
      orderData.order.note += `\nShipping Method: ${shippingOption.title} (${shippingOption.price})`;
    }

    // Create Shopify order
    const response = await client.post({
      path: "/orders.json",
      data: orderData,
      type: "application/json",
    });

    // Verify order was created successfully
    if (!response.body.order?.id) {
      throw new Error("Shopify order creation failed - no order ID returned");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        orderId: response.body.order.id,
        orderNumber: response.body.order.name,
        shopifyOrder: response.body.order // Return full order data for debugging
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error(`Order processing failed:`, error);
    
    // Determine appropriate status code
    const statusCode = error.message.includes("Missing") ? 400 : 
                      error.message.includes("Invalid") ? 422 : 500;
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Order processing failed",
        details: process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          code: error.code
        } : null
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}