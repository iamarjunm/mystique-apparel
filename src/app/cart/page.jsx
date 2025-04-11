"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext"; // Import CartContext
import formatCurrency from "@/lib/formatCurrency"; // Import currency formatter

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Handle quantity change
  const handleQuantityChange = (variantId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(variantId, newQuantity);
    } else {
      removeFromCart(variantId);
    }
  };

  // Handle remove item from cart
  const handleRemoveItem = (variantId) => {
    removeFromCart(variantId);
  };

  return (
    <div className="container mx-auto px-6 py-12 bg-black text-white">
      <h1 className="text-4xl font-extrabold text-white text-center mb-12">
        Your Cart
      </h1>

      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Your cart is empty.</p>
          <Link
            href="/shop"
            className="bg-gradient-to-r from-white to-gray-400 text-black py-3 px-8 rounded-full text-lg font-semibold hover:bg-gray-300 transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="md:col-span-2">
          {cart.map((item) => (
            <div
              key={item.variantId}
                className="flex flex-col md:flex-row items-center gap-8 p-8 bg-gray-900 rounded-2xl shadow-xl mb-6 hover:shadow-2xl transition-all duration-300"
              >
                {/* Product Image */}
                <img
                  src={item.image || "https://picsum.photos/200/200"}
                  alt={item.title}
                  className="w-32 h-32 object-cover rounded-lg shadow-lg"
                />

                {/* Product Details */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
                  <p className="text-lg text-gray-400">{formatCurrency(item.price)}</p>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.variantId, item.quantity - 1)
                    }
                    className="bg-gray-700 text-white w-10 h-10 rounded-full hover:bg-gray-600 transition-all duration-300"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.variantId, item.quantity + 1)
                    }
                    className="bg-gray-700 text-white w-10 h-10 rounded-full hover:bg-gray-600 transition-all duration-300"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.variantId)}
                  className="text-red-500 hover:text-red-600 transition-all duration-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col justify-between">
            <h2 className="text-3xl font-bold text-white mb-8">Order Summary</h2>

            {/* Subtotal */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg text-gray-400">Subtotal</p>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(totalPrice)}
              </p>
            </div>

            {/* Shipping */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg text-gray-400">Shipping</p>
              <p className="text-xl font-semibold text-white">Calculated at checkout</p>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-8">
              <p className="text-lg text-gray-400">Total</p>
              <p className="text-2xl font-extrabold text-white">
                {formatCurrency(totalPrice)}
              </p>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full bg-gradient-to-r from-white to-gray-400 text-black py-4 px-8 rounded-full text-xl font-semibold text-center hover:bg-gray-300 transition-all duration-300"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
