import React from "react";

const PaymentMethodSelector = ({ paymentMethod, setPaymentMethod }) => {
  const paymentMethods = [
    {
      id: "razorpay",
      name: "Razorpay",
      description: "Pay securely with Razorpay (UPI, Cards, Net Banking, Wallets)",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24z"/>
          <path d="M14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902z" opacity=".6"/>
        </svg>
      ),
      enabled: true
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay ₹150 advance now, pay remaining amount on delivery",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      enabled: true,
      comingSoon: false
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900/60 to-black p-3 sm:p-4 md:p-5 rounded-xl border border-gray-700/50 backdrop-blur shadow-xl">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-white">💳 Payment Method</h2>
      <div className="space-y-2.5 sm:space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`relative p-2.5 sm:p-3.5 rounded-lg border-2 transition-all duration-300 cursor-pointer transform ${
              paymentMethod === method.id && method.enabled
                ? "border-white bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg scale-[1.02]"
                : "border-gray-700 hover:border-gray-600 hover:bg-gray-900/30"
            } ${!method.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => method.enabled && setPaymentMethod(method.id)}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              {/* Radio button */}
              <div className="flex-shrink-0 mt-1">
                <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    paymentMethod === method.id && method.enabled
                      ? "border-white bg-white"
                      : "border-gray-600"
                  }`}
                >
                  {paymentMethod === method.id && method.enabled && (
                    <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-black"></div>
                  )}
                </div>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 text-white">
                <div className="w-5 sm:w-6 h-5 sm:h-6">{method.icon}</div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-xs sm:text-sm text-white">{method.name}</h3>
                  {method.comingSoon && (
                    <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-semibold">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{method.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment security notice */}
      <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gradient-to-r from-green-900/30 to-green-800/10 rounded-lg border border-green-600/50 backdrop-blur">
        <div className="flex items-start gap-2">
          <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="text-xs text-gray-200 font-semibold">🔒 Secure Payment</p>
            <p className="text-xs text-gray-400 mt-0.5">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
