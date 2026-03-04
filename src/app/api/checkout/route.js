import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper for validation
function validateRequestData({ cart, email, shippingAddress, totalAmount }) {
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    throw new Error("Invalid cart items");
  }
  
  // Convert to number and validate
  const amount = parseFloat(totalAmount);
  if (isNaN(amount) || amount < 0) {
    throw new Error(`Invalid amount: ${totalAmount} (type: ${typeof totalAmount})`);
  }
  
  // Allow 0 amount for free orders/fully discounted orders
  // Add more validation as needed
}

export async function POST(req) {
  try {
    const requestData = await req.json();
    validateRequestData(requestData);
    
    let { cart, email, shippingAddress, totalAmount } = requestData;

    // Ensure totalAmount is a number
    totalAmount = parseFloat(totalAmount);
    
    if (isNaN(totalAmount) || totalAmount < 0) {
      throw new Error(`Invalid totalAmount: ${totalAmount} (type: ${typeof totalAmount})`);
    }

    // For 0 amount orders (free/fully discounted), create order without Razorpay
    if (totalAmount === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          orderId: `free_order_${Date.now()}`,
          amount: 0,
          currency: "INR",
          isFreeOrder: true,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        email,
        shippingAddress: JSON.stringify(shippingAddress),
        cart: JSON.stringify(cart),
      },
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in payment processing:", error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Payment processing failed" 
      }),
      {
        status: error instanceof TypeError ? 400 : 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}