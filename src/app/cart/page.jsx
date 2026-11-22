"use client";

import React from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import formatCurrency from "@/lib/formatCurrency";
import { toast } from "react-toastify";

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartPage() {
  const { cart, cartCount, cartSubtotal, removeFromCart, updateQuantity } = useCart();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const progress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleQuantityChange = (item, newQuantity) => {
    const maxStock = item.stock || 999;
    if (newQuantity > maxStock) {
      toast.info(`Only ${maxStock} pieces available in stock.`);
      return;
    }
    updateQuantity(item.variantId, newQuantity, item.size, item.color);
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-12 border-b border-[#0D0D0D]/12 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono-tech text-[10px] tracking-[0.32em] uppercase text-[#64625C] block mb-2.5">
              Mystique Apparel // Bag
            </span>
            <h1 className="font-display italic text-4xl sm:text-5xl font-semibold text-[#0D0D0D] tracking-[-0.015em]">
              Your Shopping Bag
            </h1>
          </div>
          <p className="font-mono-tech text-[11px] text-[#64625C] uppercase tracking-[0.2em]">
            {cartCount} {cartCount === 1 ? "Piece" : "Pieces"} Ready For Checkout
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="max-w-xl mx-auto text-center bg-white border border-[#0D0D0D]/12 rounded-[2px] p-10 sm:p-14 my-8">
            <div className="w-14 h-14 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-5 h-5 text-[#64625C]" />
            </div>
            <h2 className="font-display italic text-3xl text-[#0D0D0D] mb-3">
              Your Bag Is Empty
            </h2>
            <p className="font-body text-sm text-[#64625C] mb-8 leading-relaxed max-w-sm mx-auto">
              Explore our heavyweight 240 GSM oversized silhouettes and small-batch architectural essentials.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 bg-[#0D0D0D] text-[#F6F5F1] py-3.5 px-9 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-[#262626] transition-colors"
            >
              <span>Explore The Archive</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Banner */}
              <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-5">
                <div className="flex items-center justify-between gap-4 text-xs mb-3">
                  <span className="flex items-center gap-2.5 text-[#0D0D0D]">
                    <Truck className="w-4 h-4 text-[#0D0D0D] flex-shrink-0" />
                    {remaining > 0 ? (
                      <span className="font-body text-[#64625C]">
                        Add{" "}
                        <span className="text-[#0D0D0D] font-semibold">
                          {formatCurrency(remaining)}
                        </span>{" "}
                        more to unlock complimentary Pan-India express shipping
                      </span>
                    ) : (
                      <span className="text-[#1A5D3A] font-medium inline-flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Complimentary Express Shipping Unlocked
                      </span>
                    )}
                  </span>
                  <span className="font-mono-tech text-[10px] tracking-[0.15em] text-[#64625C] flex-shrink-0">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full h-1 bg-[#EAE8E2] overflow-hidden">
                  <div
                    className="h-full bg-[#0D0D0D] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Cart Items */}
              {cart.map((item) => (
                <div
                  key={`${item.variantId}-${item.size}-${item.color}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 p-4 sm:p-5 bg-white border border-[#0D0D0D]/12 rounded-[2px] hover:border-[#0D0D0D]/28 transition-colors"
                >
                  <Link
                    href={item.productHandle ? `/product/${item.productHandle}` : "/shop"}
                    className="w-24 h-28 sm:w-28 sm:h-36 rounded-[2px] overflow-hidden bg-[#EAE8E2] border border-[#0D0D0D]/10 flex-shrink-0"
                  >
                    <img
                      src={item.image || "https://picsum.photos/200/260"}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={item.productHandle ? `/product/${item.productHandle}` : "/shop"}
                      className="font-display italic text-lg sm:text-xl text-[#0D0D0D] hover:opacity-70 transition-opacity line-clamp-2"
                    >
                      {item.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {item.size && (
                        <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-[2px] bg-[#EAE8E2] text-[#0D0D0D]">
                          Size {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="font-body text-xs capitalize px-2.5 py-1 rounded-[2px] border border-[#0D0D0D]/12 text-[#64625C]">
                          {String(item.color).replace(/-/g, " ")}
                        </span>
                      )}
                    </div>

                    <p className="font-mono-tech text-xs text-[#64625C] mt-3">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#0D0D0D]/10">
                    <p className="font-body text-base sm:text-lg font-semibold text-[#0D0D0D]">
                      {formatCurrency(item.price * item.quantity)}
                    </p>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center bg-[#F6F5F1] border border-[#0D0D0D]/16 rounded-[2px]">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#0D0D0D]/70 hover:text-[#0D0D0D] hover:bg-[#EAE8E2] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono-tech text-xs text-[#0D0D0D] w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#0D0D0D]/70 hover:text-[#0D0D0D] hover:bg-[#EAE8E2] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variantId, item.size, item.color)}
                        className="w-8 h-8 rounded-[2px] border border-[#0D0D0D]/15 flex items-center justify-center text-[#64625C] hover:text-[#991B1B] hover:border-[#991B1B]/40 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-6 sm:p-7 space-y-5">
                <div className="border-b border-[#0D0D0D]/10 pb-4">
                  <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C] block mb-1">
                    Summary
                  </span>
                  <h2 className="font-display italic text-2xl text-[#0D0D0D]">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#64625C]">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="text-[#0D0D0D] font-medium">
                      {formatCurrency(cartSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#64625C]">
                    <span>Shipping</span>
                    <span className={remaining === 0 ? "text-[#1A5D3A] font-medium" : "text-[#0D0D0D]"}>
                      {remaining === 0 ? "Complimentary" : "Calculated at checkout"}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-4 border-t border-[#0D0D0D]/12">
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-[#64625C]">
                    Estimated Total
                  </span>
                  <span className="font-display text-3xl font-semibold text-[#0D0D0D]">
                    {formatCurrency(cartSubtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2.5 bg-[#0D0D0D] text-[#F6F5F1] py-4 px-6 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-[#262626] transition-colors"
                >
                  <span>Proceed To Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/shop"
                  className="block text-center font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] hover:text-[#0D0D0D] transition-colors pt-1"
                >
                  Continue Exploring Archive
                </Link>

                <div className="pt-4 border-t border-[#0D0D0D]/10 flex items-center justify-center gap-2 text-[11px] text-[#64625C]">
                  <ShieldCheck className="w-4 h-4 text-[#0D0D0D]" />
                  <span>Encrypted Razorpay UPI, Cards &amp; COD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
