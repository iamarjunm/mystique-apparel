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
  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity > 0) {
      // Check stock limit if available
      const maxStock = item.stock || 999; // Default to 999 if stock not tracked
      if (newQuantity <= maxStock) {
        updateQuantity(item.variantId, newQuantity, item.size, item.color);
      } else {
        alert(`Only ${maxStock} items available in stock.`);
      }
    } else {
      removeFromCart(item.variantId, item.size, item.color);
    }
  };

  // Handle remove item from cart
  const handleRemoveItem = (item) => {
    removeFromCart(item.variantId, item.size, item.color);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
      <div className="container mx-auto px-4 sm:px-5 md:px-6 py-6 sm:py-8 md:py-10">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-1.5 sm:mb-2">
            Your Cart
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            {cart.length} item{cart.length !== 1 ? "s" : ""} ready for checkout
          </p>
        </div>

      {cart.length === 0 ? (
        <div className="max-w-xl mx-auto text-center bg-gradient-to-br from-gray-900/60 to-black border border-gray-700/50 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          <p className="text-base sm:text-lg text-gray-300 mb-4">Your cart is empty.</p>
          <Link
            href="/shop"
            className="inline-block bg-gradient-to-r from-white to-gray-200 text-black py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg text-sm sm:text-base font-semibold hover:from-gray-100 hover:to-gray-300 transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.variantId}-${item.size}-${item.color}`}
                className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-gray-900/70 to-black border border-gray-700/50 rounded-xl shadow-xl hover:border-gray-600/70 transition-all duration-300"
              >
                {/* Product Image */}
                <img
                  src={item.image || "https://picsum.photos/200/200"}
                  alt={item.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg border border-gray-700/60 shadow-lg"
                />

                {/* Product Details */}
                <div className="flex-1">
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1.5 line-clamp-2">{item.title}</h2>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-sm sm:text-base text-gray-300">{formatCurrency(item.price)}</p>
                    {item.color && (
                      <p className="text-xs sm:text-sm text-gray-400">
                        Color: <span className="text-white capitalize">{item.color}</span>
                      </p>
                    )}
                    {item.size && (
                      <p className="text-xs sm:text-sm text-gray-400">
                        Size: <span className="text-white uppercase">{item.size}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() =>
                      handleQuantityChange(item, item.quantity - 1)
                    }
                    className="bg-gray-800 border border-gray-700 text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-gray-700 transition-all duration-300"
                  >
                    -
                  </button>
                  <span className="text-sm sm:text-base font-bold w-5 sm:w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item, item.quantity + 1)
                    }
                    className="bg-gray-800 border border-gray-700 text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-gray-700 transition-all duration-300"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="text-red-400 hover:text-red-300 text-xs sm:text-sm transition-all duration-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-gray-900/60 to-black p-4 sm:p-5 md:p-6 rounded-xl border border-gray-700/50 backdrop-blur shadow-2xl sticky top-20">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-5 md:mb-6">Order Summary</h2>

            {/* Subtotal */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs sm:text-sm text-gray-400">Subtotal</p>
              <p className="text-sm sm:text-base font-semibold text-white">
                {formatCurrency(totalPrice)}
              </p>
            </div>

            {/* Shipping */}
            <div className="flex justify-between items-center mb-4 gap-3">
              <p className="text-xs sm:text-sm text-gray-400">Shipping</p>
              <p className="text-xs sm:text-sm font-semibold text-white text-right">Calculated at checkout</p>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-700/60 mb-5 sm:mb-6">
              <p className="text-sm sm:text-base text-gray-300 font-semibold">Total</p>
              <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-white">
                {formatCurrency(totalPrice)}
              </p>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full block bg-gradient-to-r from-white to-gray-200 text-black py-2.5 sm:py-3 px-5 rounded-lg text-sm sm:text-base font-semibold text-center hover:from-gray-100 hover:to-gray-300 transition-all duration-300"
            >
              Proceed to Checkout
            </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Cart;
