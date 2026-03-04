import React from "react";

const PaymentButton = ({ 
  loading, 
  selectedShippingRate, 
  onClick,
  cart = [],
  razorpayLoaded = false,
  paymentMethod = "razorpay",
  totalAmount = 0
}) => {
  // Check for Razorpay in window object
  const isRazorpayReady = razorpayLoaded && typeof window.Razorpay !== 'undefined';
  
  // Single isDisabled declaration using the more accurate isRazorpayReady check
  const isDisabled = loading || !selectedShippingRate || cart.length === 0 || !isRazorpayReady;
  
  console.log('PaymentButton props:', {
    loading,
    selectedShippingRate,
    cartItems: cart.length,
    hasShipping: !!selectedShippingRate,
    razorpayLoaded,
    isRazorpayReady
  });

  let tooltipMessage = '';
  
  if (loading) {
    tooltipMessage = 'Processing your order...';
  } else if (cart.length === 0) {
    tooltipMessage = 'Your cart is empty';
  } else if (!selectedShippingRate) {
    tooltipMessage = 'Please select a shipping method';
  } else if (!isRazorpayReady) {
    tooltipMessage = 'Payment system loading...';
  }

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Add this line
    console.log('Payment button clicked', {
      isDisabled,
      razorpayReady: isRazorpayReady,
      windowRazorpay: window.Razorpay !== undefined
    });
  
    if (!isDisabled && onClick) {
      onClick(e);
    } else {
      console.warn('Payment button click prevented due to:', {
        loading,
        hasShipping: !!selectedShippingRate,
        hasCartItems: cart.length > 0,
        razorpayReady: isRazorpayReady
      });
    }
  };

  return (
    <div className="relative group">
      <button
        type="button"
        className={`w-full bg-gradient-to-r from-white to-gray-300 text-black py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-5 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 ${
          isDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:from-gray-100 hover:to-gray-400 hover:shadow-xl transform hover:scale-[1.01]'
        }`}
        disabled={isDisabled}
        onClick={handleClick}
        aria-label={tooltipMessage}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-1.5 sm:gap-2">
            <svg className="animate-spin h-3.5 sm:h-4.5 w-3.5 sm:w-4.5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs sm:text-sm">Processing Payment...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1 sm:gap-1.5">
            <svg className="w-3.5 sm:w-4.5 h-3.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs sm:text-sm">
              {paymentMethod === "cod" ? `Pay ₹${totalAmount > 0 ? Math.round(totalAmount).toLocaleString('en-IN') : '0'} on Delivery` : "Complete Order"}
            </span>
          </span>
        )}
      </button>

      {/* Tooltip for disabled state */}
      {isDisabled && !loading && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gray-700">
          {tooltipMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentButton;