import React from "react";
import { Lock, Loader2 } from "lucide-react";

const PaymentButton = ({
  loading,
  selectedShippingRate,
  onClick,
  cart = [],
  razorpayLoaded = false,
  paymentMethod = "razorpay",
  totalAmount = 0,
}) => {
  const isRazorpayReady =
    razorpayLoaded && typeof window !== "undefined" && typeof window.Razorpay !== "undefined";

  const isDisabled =
    loading || !selectedShippingRate || cart.length === 0 || (!isRazorpayReady && totalAmount > 0);

  let tooltipMessage = "";
  if (loading) {
    tooltipMessage = "Processing your order...";
  } else if (cart.length === 0) {
    tooltipMessage = "Your bag is empty";
  } else if (!selectedShippingRate) {
    tooltipMessage = "Save a valid 6-digit PIN shipping address first";
  } else if (!isRazorpayReady && totalAmount > 0) {
    tooltipMessage = "Initializing secure payment gateway...";
  }

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };

  const buttonLabel =
    totalAmount === 0
      ? "Complete Complimentary Order"
      : paymentMethod === "cod"
      ? "Pay ₹150 COD Advance Now"
      : `Pay ₹${Math.round(totalAmount).toLocaleString("en-IN")} Securely`;

  return (
    <div className="relative">
      <button
        type="button"
        className={`w-full bg-[#0D0D0D] text-[#F6F5F1] py-4 px-6 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors ${
          isDisabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-[#262626]"
        }`}
        disabled={isDisabled}
        onClick={handleClick}
        aria-label={tooltipMessage || buttonLabel}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Order...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span>{buttonLabel}</span>
          </span>
        )}
      </button>

      {isDisabled && !loading && tooltipMessage && (
        <p className="text-center font-mono-tech text-[10px] tracking-[0.1em] text-[#64625C] mt-2.5">
          {tooltipMessage}
        </p>
      )}
    </div>
  );
};

export default PaymentButton;
