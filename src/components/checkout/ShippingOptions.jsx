import React, { useEffect, useState } from "react";

const ShippingOptions = ({
  setShippingRates,
  selectedShippingRate,
  setSelectedShippingRate,
  shippingAddress,
  cart,
}) => {
  const [error, setError] = useState(null);

  // Define the single, fixed shipping option
  const STANDARD_DELIVERY_OPTION = {
    id: "standard_delivery",
    title: "Standard Delivery",
    price: "₹100.00",
    deliveryTime: "3-7 business days", // A reasonable range for standard delivery
    rawPrice: 100, // Store the raw number for calculations if needed elsewhere
  };

  useEffect(() => {
    // Clear any previous errors or rates first
    setError(null);
    setShippingRates([]);
    setSelectedShippingRate(null);

    const pin = shippingAddress?.zip;

    // Validate PIN code
    if (!pin || !/^\d{6}$/.test(pin)) {
      setError("Please enter a valid 6-digit Indian PIN code for shipping.");
      return;
    }

    // Validate cart
    if (!cart || cart.length === 0) {
      setError("Your cart is empty. Add items to calculate shipping.");
      return;
    }

    // If validation passes, set the single standard delivery option
    const availableRate = [STANDARD_DELIVERY_OPTION];
    setShippingRates(availableRate);

    // Automatically select the standard delivery option
    setSelectedShippingRate(STANDARD_DELIVERY_OPTION);

  }, [shippingAddress?.zip, cart, setShippingRates, setSelectedShippingRate]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-white"> {/* Added text-white for dark background */}
      <h2 className="text-2xl font-semibold mb-4">Shipping Options</h2>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {/* Display the single shipping option when valid */}
      {!error && (
        <div className="space-y-4">
          <div
            key={STANDARD_DELIVERY_OPTION.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedShippingRate?.id === STANDARD_DELIVERY_OPTION.id
                ? "border-green-500 bg-gray-800"
                : "border-gray-700 hover:border-gray-600"
            }`}
            onClick={() => setSelectedShippingRate(STANDARD_DELIVERY_OPTION)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-lg">{STANDARD_DELIVERY_OPTION.title}</p>
                <p className="text-sm text-gray-400">
                  {STANDARD_DELIVERY_OPTION.deliveryTime}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{STANDARD_DELIVERY_OPTION.price}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedShippingRate(STANDARD_DELIVERY_OPTION);
                  }}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                >
                  {selectedShippingRate?.id === STANDARD_DELIVERY_OPTION.id ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message if conditions are not met, and no error is present */}
      {!error && (!shippingAddress?.zip || !/^\d{6}$/.test(shippingAddress.zip)) && (
        <p className="text-gray-400">Please enter a valid 6-digit Indian PIN code to view shipping options.</p>
      )}
      {!error && (cart === null || cart.length === 0) && (
        <p className="text-gray-400">Your cart is empty. Add items to calculate shipping.</p>
      )}
    </div>
  );
};

export default ShippingOptions;