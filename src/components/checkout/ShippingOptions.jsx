import React, { useEffect, useState } from "react";
import { Truck, AlertCircle } from "lucide-react";

const STANDARD_DELIVERY_OPTION = {
  id: "standard_delivery",
  title: "Standard Express Delivery",
  price: "₹100.00",
  deliveryTime: "3–7 business days • Tracked Pan-India",
  rawPrice: 100,
};

const ShippingOptions = ({
  setShippingRates,
  selectedShippingRate,
  setSelectedShippingRate,
  shippingAddress,
  cart,
}) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setShippingRates([]);
    setSelectedShippingRate(null);

    const pin = shippingAddress?.zip;
    if (!pin || !/^\d{6}$/.test(pin)) {
      setError("Save your shipping address with a valid 6-digit Indian PIN code to unlock delivery.");
      return;
    }

    if (!cart || cart.length === 0) {
      setError("Your bag is empty.");
      return;
    }

    setShippingRates([STANDARD_DELIVERY_OPTION]);
    setSelectedShippingRate(STANDARD_DELIVERY_OPTION);
  }, [shippingAddress?.zip, cart, setShippingRates, setSelectedShippingRate]);

  return (
    <div className="bg-white border border-[#0D0D0D]/12 p-5 sm:p-6 rounded-[2px] space-y-4 text-[#0D0D0D]">
      <div className="flex items-center gap-2.5 border-b border-[#0D0D0D]/10 pb-4">
        <Truck className="w-4 h-4 text-[#0D0D0D]" />
        <h2 className="font-display italic text-xl sm:text-2xl text-[#0D0D0D]">
          Shipping Method
        </h2>
      </div>

      {error ? (
        <div className="p-4 rounded-[2px] bg-[#7C4A15]/6 border border-[#7C4A15]/20 flex items-start gap-3 text-[#7C4A15]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">{error}</p>
        </div>
      ) : (
        <div
          onClick={() => setSelectedShippingRate(STANDARD_DELIVERY_OPTION)}
          className={`p-4 rounded-[2px] border transition-colors cursor-pointer flex items-center justify-between gap-4 ${
            selectedShippingRate?.id === STANDARD_DELIVERY_OPTION.id
              ? "border-[#0D0D0D] bg-[#F6F5F1]"
              : "border-[#0D0D0D]/12 bg-white hover:border-[#0D0D0D]/35"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedShippingRate?.id === STANDARD_DELIVERY_OPTION.id
                  ? "border-[#0D0D0D] bg-[#0D0D0D]"
                  : "border-[#0D0D0D]/30 bg-white"
              }`}
            >
              {selectedShippingRate?.id === STANDARD_DELIVERY_OPTION.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#F6F5F1]" />
              )}
            </div>
            <div>
              <p className="font-body text-sm font-semibold text-[#0D0D0D]">
                {STANDARD_DELIVERY_OPTION.title}
              </p>
              <p className="font-body text-xs text-[#64625C] mt-0.5">
                {STANDARD_DELIVERY_OPTION.deliveryTime}
              </p>
            </div>
          </div>
          <span className="font-mono-tech text-sm font-semibold text-[#0D0D0D]">
            {STANDARD_DELIVERY_OPTION.price}
          </span>
        </div>
      )}
    </div>
  );
};

export default ShippingOptions;
