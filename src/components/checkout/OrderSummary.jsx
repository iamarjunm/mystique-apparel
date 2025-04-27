import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import formatCurrency from "@/lib/formatCurrency";

const OrderSummary = ({ cart, selectedShippingRate, setTotal }) => {
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

  // Parse shipping cost safely
  const shippingCost = useMemo(() => {
    if (!selectedShippingRate) return 0;
    
    try {
      if (typeof selectedShippingRate.price === "string") {
        return parseFloat(selectedShippingRate.price.replace(/[^\d.]/g, "")) || 0;
      }
      return selectedShippingRate.rate || 0;
    } catch (error) {
      console.error("Error parsing shipping rate:", error);
      return 0;
    }
  }, [selectedShippingRate]);

  // Calculate total
  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

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

  return (
    <div className="md:col-span-2">
      <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
      <div className="bg-gray-900 p-6 rounded-lg">
        {/* Cart items */}
        {cart.length > 0 ? (
          cart.map((item) => (
            <div 
              key={`${item.id}-${item.variantId}`} 
              className="flex justify-between items-center mb-4"
            >
              <div>
                <p className="font-medium">{item.title || "Unnamed Item"}</p>
                {item.variantTitle && (
                  <p className="text-sm text-gray-400">{item.variantTitle}</p>
                )}
                <p className="text-sm text-gray-400">Qty: {item.quantity || 1}</p>
              </div>
              <p>{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Your cart is empty</p>
        )}

        {/* Shipping */}
        {selectedShippingRate && (
          <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-700">
            <div>
              <p>Shipping</p>
              <p className="text-sm text-gray-400">
                {selectedShippingRate.title || selectedShippingRate.courier_name || "Standard Shipping"}
              </p>
              {selectedShippingRate.deliveryTime && (
                <p className="text-sm text-gray-400">
                  Est. delivery: {selectedShippingRate.deliveryTime}
                </p>
              )}
            </div>
            <p>{formatPrice(shippingCost)}</p>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
          <p className="text-xl font-bold">Total</p>
          <p className="text-xl font-bold">
            {formatPrice(total)}
          </p>
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
};

OrderSummary.defaultProps = {
  cart: [],
  selectedShippingRate: null,
  setTotal: () => {},
};

export default OrderSummary;