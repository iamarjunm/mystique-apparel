// src/lib/razorpay.js

export async function initiateRazorpayPayment(orderDetails) {
    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: orderDetails.amount * 100, // Convert to paise
        currency: "INR",
        name: "Mystique Apparel",
        description: "Order Payment",
        order_id: orderDetails.id,
        handler: function (response) {
          resolve(response);
        },
        prefill: {
          name: orderDetails.user?.name || "Guest User",
          email: orderDetails.user?.email || "",
          contact: orderDetails.user?.phone || "",
        },
        theme: {
          color: "#000000",
        },
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }