"use client";

import React from "react";

const OrderConfirmationPage = () => {
  return (
    <div className="container mx-auto px-6 py-12 bg-black text-white">
      <h1 className="text-4xl font-extrabold text-white text-center mb-12">Order Confirmation</h1>
      <div className="text-center">
        <p className="text-xl text-gray-400 mb-4">Thank you for your order!</p>
        <p className="text-lg text-gray-400">Your order has been successfully placed.</p>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;