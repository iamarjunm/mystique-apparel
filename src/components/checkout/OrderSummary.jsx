import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { client } from "@/sanity";
import formatCurrency from "@/lib/formatCurrency";

const OrderSummary = ({ 
  cart, 
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
  paymentMethod = "razorpay"
}) => {
  const [shippingSettings, setShippingSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch shipping settings
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
        console.error('Error fetching shipping settings:', error);
        setShippingSettings({ shippingEnabled: true, standardShippingCost: 0, freeShippingThreshold: 0 });
      } finally {
        setLoadingSettings(false);
      }
    };
    
    fetchSettings();
  }, []);
  // Validate props
  if (!Array.isArray(cart)) {
    console.error("Invalid cart prop - expected array, received:", typeof cart);
    return <div className="text-red-500">Invalid cart data</div>;
  }

  // Calculate subtotal using useMemo for performance
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      if (!item || typeof item.price !== "number" || typeof item.quantity !== "number") {
        console.warn("Invalid cart item:", item);
        return total;
      }
      return total + (item.price * item.quantity);
    }, 0);
  }, [cart]);

  // Parse shipping cost safely (respects shipping enabled setting)
  const shippingCost = useMemo(() => {
    if (!shippingSettings?.shippingEnabled) return 0; // No charge if shipping is disabled
    if (!selectedShippingRate) return 0;
    
    // Check if discount provides free shipping
    if (appliedDiscount?.freeShipping) return 0;
    
    // Check if eligible for free shipping based on threshold
    if (shippingSettings?.freeShippingThreshold > 0 && subtotal >= shippingSettings.freeShippingThreshold) {
      return 0;
    }
    
    try {
      if (typeof selectedShippingRate.price === "string") {
        return parseFloat(selectedShippingRate.price.replace(/[^\d.]/g, "")) || 0;
      }
      return selectedShippingRate.rate || 0;
    } catch (error) {
      console.error("Error parsing shipping rate:", error);
      return 0;
    }
  }, [selectedShippingRate, appliedDiscount, subtotal, shippingSettings]);

  // Calculate discount amount
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return appliedDiscount.amount || 0;
  }, [appliedDiscount]);

  // Calculate total
  const total = useMemo(() => {
    const calculatedTotal = subtotal + shippingCost - discountAmount;
    return Math.max(0, calculatedTotal); // Ensure total is not negative
  }, [subtotal, shippingCost, discountAmount]);

  // Pass total to parent
  useEffect(() => {
    if (typeof setTotal === "function") {
      setTotal(total);
    }
  }, [total, setTotal]);

  // Format price safely
  const formatPrice = (price) => {
    try {
      return formatCurrency(price);
    } catch (error) {
      console.error("Error formatting price:", error);
      return "₹0.00";
    }
  };

  // Handle discount code application
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    setApplyingDiscount(true);
    setDiscountError("");
    setAppliedDiscount(null);

    try {
      const response = await fetch("/api/validate-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: discountCode.trim(),
          cartTotal: subtotal,
          cartItems: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
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
      setDiscountError("Failed to apply discount code. Please try again.");
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Handle discount removal
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/60 to-black p-3 sm:p-4 md:p-5 rounded-xl border border-gray-700/50 backdrop-blur shadow-2xl">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-white">📦 Order Summary</h2>
      <div className="space-y-3 sm:space-y-4">
        {/* Cart items */}
        <div className="max-h-72 sm:max-h-80 overflow-y-auto pr-1.5 space-y-2.5 sm:space-y-3">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div 
                key={`${item.id}-${item.variantId}`} 
                className="flex justify-between items-start pb-2.5 sm:pb-3 border-b border-gray-700/50 last:border-0 hover:bg-gray-800/30 p-2 sm:p-2.5 rounded-lg transition-colors"
              >
                <div className="flex gap-2 sm:gap-2.5 flex-1">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 object-cover rounded-lg shadow-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-white truncate">{item.title || "Unnamed Item"}</p>
                    <div className="text-xs text-gray-400 space-y-0.5 mt-1">
                      {item.color && (
                        <p>Color: <span className="text-gray-300 capitalize">{item.color}</span></p>
                      )}
                      {item.size && (
                        <p className="text-xs sm:text-xs">Size: <span className="text-gray-300 uppercase">{item.size}</span></p>
                      )}
                      <p className="text-xs sm:text-xs">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                </div>
                <p className="font-semibold text-xs sm:text-sm ml-2 sm:ml-3 flex-shrink-0 text-green-400">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4 text-xs sm:text-sm">Your cart is empty</p>
          )}
        </div>

        {/* Discount Code Section */}
        <div className="pt-3 sm:pt-4 border-t border-gray-700/50">
          {!appliedDiscount ? (
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-200">🏷️ Have a discount code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    setDiscountError("");
                  }}
                  placeholder="DISCOUNT10"
                  className="flex-1 px-2.5 sm:px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
                  disabled={applyingDiscount}
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={applyingDiscount || !discountCode.trim()}
                  className="px-2.5 sm:px-3.5 py-2 bg-gradient-to-r from-white to-gray-200 text-black rounded-lg font-semibold hover:from-gray-100 hover:to-gray-300 transition-all disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-xs sm:text-sm whitespace-nowrap"
                >
                  {applyingDiscount ? "..." : "Apply"}
                </button>
              </div>
              {discountError && (
                <p className="text-red-400 text-xs mt-2">{discountError}</p>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-start bg-gradient-to-r from-green-900/40 to-green-800/20 border border-green-600/50 backdrop-blur p-2.5 sm:p-3 rounded-lg gap-2.5">
              <div>
                <p className="font-semibold text-green-400 text-xs sm:text-sm">✓ Discount Applied</p>
                <p className="text-xs text-gray-300 font-medium">{appliedDiscount.code}</p>
                {appliedDiscount.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{appliedDiscount.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveDiscount}
                className="text-red-400 hover:text-red-300 text-xs font-semibold underline flex-shrink-0"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="pt-3 sm:pt-4 border-t border-gray-700/50 space-y-2.5 sm:space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-xs sm:text-sm font-medium">Subtotal</p>
            <p className="text-white font-semibold text-xs sm:text-sm">{formatPrice(subtotal)}</p>
          </div>

          {/* Discount Amount */}
          {appliedDiscount && discountAmount > 0 && (
            <div className="flex justify-between items-center bg-green-900/20 p-2 sm:p-3 rounded-lg">
              <p className="text-green-400 text-xs sm:text-sm font-medium">Discount ({appliedDiscount.code})</p>
              <p className="text-green-400 font-bold text-xs sm:text-sm">-{formatPrice(discountAmount)}</p>
            </div>
          )}

          {/* Shipping */}
          {selectedShippingRate && (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Shipping</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedShippingRate.title || selectedShippingRate.courier_name || "Standard Shipping"}
                </p>
                {!shippingSettings?.shippingEnabled && (
                  <p className="text-xs text-green-400 font-medium mt-0.5">✓ Free shipping</p>
                )}
                {shippingSettings?.shippingEnabled && appliedDiscount?.freeShipping && (
                  <p className="text-xs text-green-400 font-medium mt-0.5">✓ Free shipping (discount)</p>
                )}
                {shippingSettings?.shippingEnabled && shippingSettings?.freeShippingThreshold > 0 && subtotal >= shippingSettings.freeShippingThreshold && !appliedDiscount?.freeShipping && (
                  <p className="text-xs text-green-400 font-medium mt-0.5">✓ Free shipping (qualified)</p>
                )}
              </div>
              <p className={`font-semibold text-xs sm:text-sm ${shippingCost === 0 ? "line-through text-gray-500" : "text-white"}`}>
                {formatPrice(shippingCost)}
              </p>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-3 sm:pt-4 border-t-2 border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-transparent p-2.5 sm:p-3 rounded-lg">
            <p className="text-sm sm:text-base font-bold text-gray-200">Total</p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-white bg-clip-text">
              {formatPrice(total)}
            </p>
          </div>

          {/* COD Payment Info */}
          {paymentMethod === "cod" && (
            <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-600/50 backdrop-blur rounded-lg">
              <p className="text-xs sm:text-sm font-bold text-blue-300 mb-2">💳 Cash on Delivery Breakdown</p>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-200">
                <div className="flex justify-between">
                  <p>Advance Payment Now:</p>
                  <span className="font-bold text-blue-100">₹150</span>
                </div>
                <div className="flex justify-between">
                  <p>Pay on Delivery:</p>
                  <span className="font-bold text-blue-100">₹{(total - 150).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
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

OrderSummary.defaultProps = {
  cart: [],
  selectedShippingRate: null,
  setTotal: () => {},
  discountCode: "",
  setDiscountCode: () => {},
  appliedDiscount: null,
  setAppliedDiscount: () => {},
  discountError: "",
  setDiscountError: () => {},
  applyingDiscount: false,
  setApplyingDiscount: () => {},
};

export default OrderSummary;