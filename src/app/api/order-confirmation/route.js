export async function POST(req) {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, checkoutId } = await req.json();
  
    // Verify the payment signature
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");
  
    if (generatedSignature !== razorpaySignature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
      });
    }
  
    // Save the order details to your database
    // ...
  
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  }