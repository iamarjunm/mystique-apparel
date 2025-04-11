import { shopifyApi } from "@shopify/shopify-api";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const {
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    cart,
    email,
    shippingAddress,
  } = await req.json();

  try {
    // Step 1: Verify Razorpay payment signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      throw new Error("Invalid Razorpay signature");
    }

    // Step 2: Initialize Shopify API client
    const shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      hostName: process.env.SHOPIFY_STORE_URL,
      scopes: ["write_orders"],
    });

    const client = new shopify.clients.Rest({
      session: {
        shop: process.env.SHOPIFY_STORE_URL,
        accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
    });

    // Step 3: Create the order directly
    const orderResponse = await client.post({
      path: "/admin/api/2024-01/orders.json",
      data: {
        order: {
          email,
          financial_status: "paid",
          line_items: cart.map((item) => ({
            variant_id: item.id,
            quantity: item.quantity,
          })),
          shipping_address: {
            first_name: shippingAddress.firstName,
            last_name: shippingAddress.lastName,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            country: shippingAddress.country,
            zip: shippingAddress.zip,
            province: shippingAddress.province,
            phone: shippingAddress.phone,
          },
          transactions: [
            {
              kind: "sale",
              status: "success",
              amount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
              gateway: "Razorpay",
              gateway_reference: razorpayPaymentId,
            },
          ],
        },
      },
      type: "application/json",
    });

    console.log("Shopify Order Created:", orderResponse.body);

    return new Response(
      JSON.stringify({ orderId: orderResponse.body.order.id }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Order creation failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create order" }),
      { status: 500 }
    );
  }
}
