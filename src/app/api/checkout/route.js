import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const { cart, email, shippingAddress, totalAmount } = await req.json();

  try {
    // Step 1: Create a Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        email,
        shippingAddress: JSON.stringify(shippingAddress),
        cart: JSON.stringify(cart),
      },
    });

    console.log("Razorpay Order Created:", razorpayOrder);

    // Step 2: Return the Razorpay order ID to the frontend
    return new Response(
      JSON.stringify({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create Razorpay order" }),
      {
        status: 500,
      }
    );
  }
}