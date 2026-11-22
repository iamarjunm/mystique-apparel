import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ShoppingBag, Tag, Check, X, ShieldCheck } from "lucide-react";
import { client } from "@/sanity";
import formatCurrency from "@/lib/formatCurrency";

const OrderSummary = ({
  cart = [],
  selectedShippingRate,
  setTotal,
  discountCode,
  setDiscountCode,
  appliedDiscount,
  setAppliedDiscount,
  discountError,
  setDiscountError,
  applyingDiscount,
  setApplyingDiscount,
  paymentMethod = "razorpay",
}) => {
  const [shippingSettings, setShippingSettings] = useState(null);

  const safeCart = Array.isArray(cart) ? cart : [];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "siteSettings"][0] {
            shippingSettings {
              shippingEnabled,
              freeShippingThreshold,
              standardShippingCost
            }
          }`
        );
        setShippingSettings(data?.shippingSettings);
      } catch (error) {
        console.error("Error fetching shipping settings:", error);
        setShippingSettings({
          shippingEnabled: true,
          standardShippingCost: 0,
          freeShippingThreshold: 0,
        });
      }
    };

    fetchSettings();
  }, []);

  const subtotal = useMemo(() => {
    return safeCart.reduce((total, item) => {
      if (!item || typeof item.price !== "number" || typeof item.quantity !== "number") {
        return total;
      }
      return total + item.price * item.quantity;
    }, 0);
  }, [safeCart]);

  const shippingCost = useMemo(() => {
    if (!shippingSettings?.shippingEnabled) return 0;
    if (!selectedShippingRate) return 0;
    if (appliedDiscount?.freeShipping) return 0;
    if (
      shippingSettings?.freeShippingThreshold > 0 &&
      subtotal >= shippingSettings.freeShippingThreshold
    ) {
      return 0;
    }

    try {
      if (typeof selectedShippingRate.price === "string") {
        return parseFloat(selectedShippingRate.price.replace(/[^\d.]/g, "")) || 0;
      }
      return selectedShippingRate.rate || selectedShippingRate.rawPrice || 0;
    } catch {
      return 0;
    }
  }, [selectedShippingRate, appliedDiscount, subtotal, shippingSettings]);

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return appliedDiscount.amount || 0;
  }, [appliedDiscount]);

  const total = useMemo(() => {
    return Math.max(0, subtotal + shippingCost - discountAmount);
  }, [subtotal, shippingCost, discountAmount]);

  useEffect(() => {
    if (typeof setTotal === "function") {
      setTotal(total);
    }
  }, [total, setTotal]);

  const formatPrice = (price) => {
    try {
      return formatCurrency(price);
    } catch {
      return "₹0.00";
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a promo code");
      return;
    }

    setApplyingDiscount(true);
    setDiscountError("");
    setAppliedDiscount(null);

    try {
      const response = await fetch("/api/validate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode.trim(),
          cartTotal: subtotal,
          cartItems: safeCart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedDiscount(data.discount);
        setDiscountError("");
      } else {
        setDiscountError(data.error || data.message || "Invalid discount code");
        setAppliedDiscount(null);
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      setDiscountError("Failed to apply promo code. Please try again.");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  if (!Array.isArray(cart)) {
    return <div className="text-[#991B1B] text-sm">Invalid bag data</div>;
  }

  return (
    <div className="bg-white border border-[#0D0D0D]/12 p-5 sm:p-6 rounded-[2px] space-y-5">
      <div className="flex items-center justify-between border-b border-[#0D0D0D]/10 pb-4">
        <div className="flex items-center gap-2.5">
          <ShoppingBag className="w-4 h-4 text-[#0D0D0D]" />
          <h2 className="font-display italic text-xl sm:text-2xl text-[#0D0D0D]">
            Order Summary
          </h2>
        </div>
        <span className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#64625C]">
          {safeCart.length} {safeCart.length === 1 ? "Line" : "Lines"}
        </span>
      </div>

      {/* Cart Items */}
      <div className="max-h-72 overflow-y-auto pr-1 space-y-3.5">
        {safeCart.length > 0 ? (
          safeCart.map((item) => (
            <div
              key={`${item.variantId || item.id}-${item.size || "std"}-${item.color || "def"}`}
              className="flex justify-between items-start gap-3 pb-3.5 border-b border-[#0D0D0D]/8 last:border-0 last:pb-0"
            >
              <div className="flex gap-3 flex-1 min-w-0">
                {item.image && (
                  <div className="w-14 h-16 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/10 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs sm:text-sm font-medium text-[#0D0D0D] truncate">
                    {item.title || "Unnamed Piece"}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {item.size && (
                      <span className="font-mono-tech text-[9px] uppercase px-2 py-0.5 rounded-[2px] bg-[#EAE8E2] text-[#0D0D0D]">
                        {item.size}
                      </span>
                    )}
                    {item.color && (
                      <span className="font-body text-[10px] capitalize px-2 py-0.5 rounded-[2px] border border-[#0D0D0D]/12 text-[#64625C]">
                        {String(item.color).replace(/-/g, " ")}
                      </span>
                    )}
                    <span className="font-mono-tech text-[10px] text-[#64625C]">
                      ×{item.quantity || 1}
                    </span>
                  </div>
                </div>
              </div>
              <p className="font-body text-xs sm:text-sm font-semibold text-[#0D0D0D] flex-shrink-0">
                {formatPrice((item.price || 0) * (item.quantity || 1))}
              </p>
            </div>
          ))
        ) : (
          <p className="text-[#64625C] text-center py-4 text-xs">Your bag is empty</p>
        )}
      </div>

      {/* Promo Code */}
      <div className="pt-4 border-t border-[#0D0D0D]/10">
        {!appliedDiscount ? (
          <div>
            <label className="flex items-center gap-1.5 font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2.5">
              <Tag className="w-3 h-3 text-[#0D0D0D]" />
              <span>Archive Promo Code</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value.toUpperCase());
                  setDiscountError("");
                }}
                placeholder="ENTER CODE"
                className="input-atelier flex-1 px-3.5 py-2.5 rounded-[2px] text-xs font-mono-tech uppercase tracking-wider"
                disabled={applyingDiscount}
              />
              <button
                type="button"
                onClick={handleApplyDiscount}
                disabled={applyingDiscount || !discountCode.trim()}
                className="px-5 py-2.5 bg-[#0D0D0D] text-[#F6F5F1] rounded-[2px] font-body text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-[#262626] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {applyingDiscount ? "..." : "Apply"}
              </button>
            </div>
            {discountError && (
              <p className="text-[#991B1B] text-xs mt-2">{discountError}</p>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center bg-[#1A5D3A]/6 border border-[#1A5D3A]/25 p-3.5 rounded-[2px] gap-3">
            <div>
              <p className="font-mono-tech text-[10px] tracking-[0.18em] uppercase text-[#1A5D3A] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Code Applied: {appliedDiscount.code}
              </p>
              {appliedDiscount.description && (
                <p className="text-xs text-[#64625C] mt-0.5">
                  {appliedDiscount.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemoveDiscount}
              className="text-[#64625C] hover:text-[#991B1B] transition-colors p-1"
              aria-label="Remove discount"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="pt-4 border-t border-[#0D0D0D]/10 space-y-2.5 text-xs sm:text-sm">
        <div className="flex justify-between text-[#64625C]">
          <span>Subtotal</span>
          <span className="text-[#0D0D0D] font-medium">{formatPrice(subtotal)}</span>
        </div>

        {appliedDiscount && discountAmount > 0 && (
          <div className="flex justify-between text-[#1A5D3A]">
            <span>Discount ({appliedDiscount.code})</span>
            <span className="font-semibold">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        {selectedShippingRate && (
          <div className="flex justify-between items-start text-[#64625C]">
            <div>
              <span>Shipping</span>
              <p className="text-[11px] text-[#64625C]/80 mt-0.5">
                {selectedShippingRate.title || "Standard Express"}
              </p>
            </div>
            <span className={shippingCost === 0 ? "text-[#1A5D3A] font-medium" : "text-[#0D0D0D] font-medium"}>
              {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-4 border-t border-[#0D0D0D]/12">
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-[#64625C]">
            Total
          </span>
          <span className="font-display text-2xl sm:text-3xl font-semibold text-[#0D0D0D]">
            {formatPrice(total)}
          </span>
        </div>

        {paymentMethod === "cod" && (
          <div className="mt-3 p-4 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/14 space-y-2 text-xs">
            <p className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#0D0D0D] flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              COD Advance Breakdown
            </p>
            <div className="flex justify-between text-[#64625C]">
              <span>Advance Paid Now (Razorpay)</span>
              <span className="text-[#0D0D0D] font-semibold">₹150.00</span>
            </div>
            <div className="flex justify-between text-[#64625C]">
              <span>Balance On Delivery</span>
              <span className="text-[#0D0D0D] font-semibold">
                {formatPrice(Math.max(0, total - 150))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  cart: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      variantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      variantTitle: PropTypes.string,
      price: PropTypes.number,
      quantity: PropTypes.number,
    })
  ).isRequired,
  selectedShippingRate: PropTypes.shape({
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rate: PropTypes.number,
    title: PropTypes.string,
    courier_name: PropTypes.string,
    deliveryTime: PropTypes.string,
  }),
  setTotal: PropTypes.func,
  discountCode: PropTypes.string,
  setDiscountCode: PropTypes.func,
  appliedDiscount: PropTypes.shape({
    code: PropTypes.string,
    type: PropTypes.string,
    amount: PropTypes.number,
    description: PropTypes.string,
    freeShipping: PropTypes.bool,
  }),
  setAppliedDiscount: PropTypes.func,
  discountError: PropTypes.string,
  setDiscountError: PropTypes.func,
  applyingDiscount: PropTypes.bool,
  setApplyingDiscount: PropTypes.func,
};

export default OrderSummary;
