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
    <div className="bg-gradient-to-br from-gray-900/60 to-black p-3 sm:p-4 md:p-5 rounded-xl border border-gray-700/50 backdrop-blur shadow-xl text-white">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">🚚 Shipping Method</h2>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-2.5 sm:p-3 rounded-lg mb-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs sm:text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Display the single shipping option when valid */}
      {!error && (
        <div className="space-y-3">
          <div
            key={STANDARD_DELIVERY_OPTION.id}
            className={`p-2.5 sm:p-3.5 border-2 rounded-lg cursor-pointer transition-all ${
              selectedShippingRate?.id === STANDARD_DELIVERY_OPTION.id
                ? "border-white bg-gray-800"
                : "border-gray-700 hover:border-gray-600"
            }`}
            onClick={() => setSelectedShippingRate(STANDARD_DELIVERY_OPTION)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2.5 sm:gap-3">
                {/* Radio button */}
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedShippingRate?.id === STANDARD_DELIVERY_OPTION.id
                        ? "border-white"
                        : "border-gray-600"
                    }`}
                  >
                    {selectedShippingRate?.id === STANDARD_DELIVERY_OPTION.id && (
                      <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                {/* Shipping icon */}
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>

                {/* Content */}
                <div>
                  <p className="font-semibold text-white text-sm sm:text-base">{STANDARD_DELIVERY_OPTION.title}</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                    {STANDARD_DELIVERY_OPTION.deliveryTime}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-base sm:text-lg font-bold">{STANDARD_DELIVERY_OPTION.price}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message if conditions are not met */}
      {!error && (!shippingAddress?.zip || !/^\d{6}$/.test(shippingAddress.zip)) && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
          <p className="text-gray-400 text-xs sm:text-sm">Please enter a valid 6-digit Indian PIN code to view shipping options.</p>
        </div>
      )}
      {!error && (cart === null || cart.length === 0) && (
        <p className="text-gray-400">Your cart is empty. Add items to calculate shipping.</p>
      )}
    </div>
  );
};

export default ShippingOptions;