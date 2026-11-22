"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import formatCurrency from "@/lib/formatCurrency";
import { toast } from "react-toastify";

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartDrawer() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleQty = (item, nextQty) => {
    const maxStock = item.stock || 99;
    if (nextQty > maxStock) {
      toast.info(`Only ${maxStock} left in stock for this piece.`);
      return;
    }
    updateQuantity(item.variantId, nextQty, item.size, item.color);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Slide-Over Alabaster Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md h-full bg-[#F6F5F1] text-[#0D0D0D] border-l border-[#0D0D0D]/12 shadow-[-20px_0_60px_rgba(0,0,0,0.18)] flex flex-col"
            aria-label="Shopping Bag"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#0D0D0D]/10 flex items-center justify-between">
              <div>
                <h2 className="font-display italic text-2xl text-[#0D0D0D] leading-none">
                  Shopping Bag
                </h2>
                <p className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mt-1.5">
                  {cartCount} {cartCount === 1 ? "Piece" : "Pieces"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="w-9 h-9 border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] transition-colors"
                aria-label="Close bag"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {cart.length > 0 && (
              <div className="px-6 py-3.5 bg-[#EAE8E2] border-b border-[#0D0D0D]/10">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="flex items-center gap-2 text-[#0D0D0D]">
                    <Truck className="w-3.5 h-3.5" />
                    {remainingForFreeShipping > 0 ? (
                      <span>
                        Add <strong>{formatCurrency(remainingForFreeShipping)}</strong> for complimentary shipping
                      </span>
                    ) : (
                      <span className="font-medium">
                        Complimentary Express Shipping Unlocked
                      </span>
                    )}
                  </span>
                  <span className="font-mono-tech text-[10px] text-[#64625C]">
                    {Math.round(freeShippingProgress)}%
                  </span>
                </div>
                <div className="w-full h-[2px] bg-[#0D0D0D]/15 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-[#0D0D0D]"
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-[#0D0D0D]/10">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingBag className="w-7 h-7 text-[#0D0D0D]/30 mb-4 stroke-[1.25px]" />
                  <h3 className="font-display italic text-2xl text-[#0D0D0D] mb-2">
                    Your Bag Is Empty
                  </h3>
                  <p className="font-body text-xs text-[#64625C] max-w-[240px] leading-relaxed mb-7">
                    Explore heavyweight 240 GSM combed cotton pieces crafted in limited runs.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2.5 bg-[#0D0D0D] text-[#F6F5F1] px-7 py-3.5 font-mono-tech text-[10px] tracking-[0.24em] uppercase hover:bg-[#262626] transition-colors"
                  >
                    <span>Explore Archive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.map((item) => {
                    const key = `${item.variantId}-${item.size}-${item.color}`;
                    return (
                      <motion.div
                        key={key}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 py-4 first:pt-0"
                      >
                        <Link
                          href={item.productHandle ? `/product/${item.productHandle}` : "/shop"}
                          onClick={closeCart}
                          className="w-20 h-24 bg-[#EAE8E2] border border-[#0D0D0D]/8 flex-shrink-0 overflow-hidden"
                        >
                          <img
                            src={item.image || "https://picsum.photos/200/260"}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={item.productHandle ? `/product/${item.productHandle}` : "/shop"}
                              onClick={closeCart}
                              className="font-body text-xs font-medium text-[#0D0D0D] hover:opacity-65 line-clamp-2 leading-snug"
                            >
                              {item.title}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.variantId, item.size, item.color)}
                              className="text-[#64625C] hover:text-[#0D0D0D] transition-colors p-0.5"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mt-1 font-mono-tech text-[10px] text-[#64625C] uppercase">
                            {item.size && <span>Size {item.size}</span>}
                            {item.size && item.color && <span>/</span>}
                            {item.color && (
                              <span className="truncate max-w-[110px]">
                                {String(item.color).replace(/-/g, " ")}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-[#0D0D0D]/20 bg-white">
                              <button
                                type="button"
                                onClick={() => handleQty(item, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono-tech text-[11px] text-[#0D0D0D] w-7 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQty(item, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="font-mono-tech text-xs font-semibold text-[#0D0D0D]">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-[#0D0D0D]/12 bg-white space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#64625C]">
                    <span>Estimated Shipping</span>
                    <span className="text-[#0D0D0D] font-medium">
                      {remainingForFreeShipping === 0 ? "Complimentary" : "Calculated at checkout"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-[#64625C]">
                      Subtotal
                    </span>
                    <span className="font-display text-2xl font-bold text-[#0D0D0D]">
                      {formatCurrency(cartSubtotal)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#0D0D0D] text-[#F6F5F1] py-4 font-mono-tech text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-[#262626] transition-colors"
                  >
                    <span>Proceed To Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="w-full block text-center py-3 border border-[#0D0D0D]/20 text-[#0D0D0D] hover:border-[#0D0D0D] font-mono-tech text-[10px] tracking-[0.22em] uppercase transition-colors"
                  >
                    View Full Bag
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-[#64625C] font-mono-tech uppercase tracking-[0.14em]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0D0D0D]" />
                  <span>Razorpay UPI, Cards &amp; COD</span>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
