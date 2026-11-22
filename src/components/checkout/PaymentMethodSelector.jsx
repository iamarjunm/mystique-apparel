import React from "react";
import { CreditCard, Banknote, ShieldCheck } from "lucide-react";

const PaymentMethodSelector = ({ paymentMethod, setPaymentMethod }) => {
  const paymentMethods = [
    {
      id: "razorpay",
      name: "Razorpay Instant Pay",
      description: "UPI, Credit & Debit Cards, Net Banking, Wallets",
      icon: CreditCard,
      badge: "Recommended",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay ₹150 advance online now, settle remaining balance on doorstep delivery",
      icon: Banknote,
      badge: "₹150 Advance",
    },
  ];

  return (
    <div className="bg-white border border-[#0D0D0D]/12 p-5 sm:p-6 rounded-[2px] space-y-4">
      <div className="flex items-center gap-2.5 border-b border-[#0D0D0D]/10 pb-4">
        <CreditCard className="w-4 h-4 text-[#0D0D0D]" />
        <h2 className="font-display italic text-xl sm:text-2xl text-[#0D0D0D]">
          Payment Method
        </h2>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const active = paymentMethod === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setPaymentMethod(method.id)}
              className={`w-full text-left p-4 rounded-[2px] border transition-colors ${
                active
                  ? "border-[#0D0D0D] bg-[#F6F5F1]"
                  : "border-[#0D0D0D]/12 bg-white hover:border-[#0D0D0D]/35"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-1">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      active ? "border-[#0D0D0D] bg-[#0D0D0D]" : "border-[#0D0D0D]/30 bg-white"
                    }`}
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-[#F6F5F1]" />}
                  </div>
                </div>

                <span className="w-9 h-9 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center justify-center text-[#0D0D0D] flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-body text-sm font-semibold text-[#0D0D0D]">
                      {method.name}
                    </h3>
                    <span
                      className={`font-mono-tech text-[9px] tracking-[0.18em] uppercase px-2.5 py-0.5 rounded-[2px] border ${
                        active
                          ? "bg-[#0D0D0D] text-[#F6F5F1] border-[#0D0D0D]"
                          : "bg-[#EAE8E2] text-[#0D0D0D] border-[#0D0D0D]/12"
                      }`}
                    >
                      {method.badge}
                    </span>
                  </div>
                  <p className="font-body text-xs text-[#64625C] mt-1 leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3.5 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center gap-3">
        <ShieldCheck className="w-4 h-4 text-[#0D0D0D] flex-shrink-0" />
        <p className="font-body text-xs text-[#64625C]">
          256-bit SSL encrypted checkout powered by Razorpay. We never store your card details.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
