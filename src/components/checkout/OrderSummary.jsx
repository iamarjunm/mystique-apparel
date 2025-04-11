// components/OrderSummary.jsx
import React from "react";
import formatCurrency from "@/lib/formatCurrency";

const OrderSummary = ({ cart, selectedShippingRate }) => {
  // Debugging logs
  console.log('OrderSummary props:', {
    cart: cart,
    selectedShippingRate: selectedShippingRate
  });

  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    console.log(`Item: ${item.title} - Price: ${item.price} x Qty: ${item.quantity} = ${itemTotal}`);
    return total + itemTotal;
  }, 0);
  console.log('Subtotal:', subtotal);

  // Handle shipping rate
  const shippingCost = selectedShippingRate ? 
    (typeof selectedShippingRate.price === 'string' ? 
      parseFloat(selectedShippingRate.price.replace(/[^\d.]/g, '')) : 
      selectedShippingRate.rate || 0) : 
    0;
  
  console.log('Shipping cost:', shippingCost);

  // Calculate total
  const total = subtotal + shippingCost;
  console.log('Total:', total);

  return (
    <div className="md:col-span-2">
      <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
      <div className="bg-gray-900 p-6 rounded-lg">
        {/* Cart items */}
        {cart.map((item) => (
          <div key={`${item.id}-${item.variantId}`} className="flex justify-between items-center mb-4">
            <div>
              <p className="font-medium">{item.title}</p>
              {item.variantTitle && <p className="text-sm text-gray-400">{item.variantTitle}</p>}
              <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
            </div>
            <p>{formatCurrency(item.price * item.quantity)}</p>
          </div>
        ))}

        {/* Shipping */}
        {selectedShippingRate && (
          <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-700">
            <div>
              <p>Shipping</p>
              <p className="text-sm text-gray-400">
                {selectedShippingRate.title || selectedShippingRate.courier_name}
              </p>
              {selectedShippingRate.deliveryTime && (
                <p className="text-sm text-gray-400">
                  Est. delivery: {selectedShippingRate.deliveryTime}
                </p>
              )}
            </div>
            <p>
              {formatCurrency(
                typeof selectedShippingRate.price === 'string' ? 
                  parseFloat(selectedShippingRate.price.replace(/[^\d.]/g, '')) : 
                  selectedShippingRate.rate
              )}
            </p>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
          <p className="text-xl font-bold">Total</p>
          <p className="text-xl font-bold">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;