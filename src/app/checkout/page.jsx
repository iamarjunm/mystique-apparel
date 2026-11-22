"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Lock, ShoppingBag, Loader2 } from "lucide-react";
import UserInformationForm from "@/components/checkout/UserInformationForm";
import ShippingAddressForm from "@/components/checkout/ShippingAddressForm";
import ShippingOptions from "@/components/checkout/ShippingOptions";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentButton from "@/components/checkout/PaymentButton";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user: legacyUser } = useUser();
  const { user: authUser, userData } = useAuth();
  const router = useRouter();

  const normalizePhone = (value = "") => {
    if (!value) return "";
    return String(value).replace(/^\+91\s?/, "").replace(/\D/g, "").slice(-10);
  };

  const parseName = (name = "") => {
    const trimmed = name.trim();
    if (!trimmed) return { firstName: "", lastName: "" };
    const parts = trimmed.split(/\s+/);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  const generateAddressHash = (addr) => {
    const content = `${addr.firstName || ""}-${addr.lastName || ""}-${addr.address1 || ""}-${addr.city || ""}-${addr.zip || ""}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `addr-${Math.abs(hash).toString(36)}`;
  };

  const mapSavedAddressForCheckout = (addr = {}, fallbackName = "", fallbackPhone = "") => {
    const parsedName = parseName(addr.name || fallbackName);
    const firstName = addr.firstName || parsedName.firstName || "";
    const lastName = addr.lastName || parsedName.lastName || "";
    const uniqueId =
      addr.id ||
      addr._key ||
      generateAddressHash({
        firstName,
        lastName,
        address1: addr.address1 || addr.street || "",
        city: addr.city || "",
        zip: addr.zip || addr.postalCode || "",
      });

    return {
      ...addr,
      id: uniqueId,
      firstName,
      lastName,
      address1: addr.address1 || addr.street || "",
      address2: addr.address2 || "",
      city: addr.city || "",
      province: addr.province || addr.state || "",
      zip: addr.zip || addr.postalCode || "",
      country: addr.country || "India",
      phone: normalizePhone(addr.phone || fallbackPhone),
      isPrimary: !!addr.isPrimary,
      _key: addr._key,
    };
  };

  const activeUser = authUser || legacyUser;
  const baseDisplayName =
    userData?.displayName ||
    authUser?.displayName ||
    [legacyUser?.firstName, legacyUser?.lastName].filter(Boolean).join(" ") ||
    "";
  const baseEmail = userData?.email || authUser?.email || legacyUser?.email || "";
  const basePhone = userData?.phoneNumber || authUser?.phoneNumber || legacyUser?.phone || "";

  const mappedSavedAddresses = useMemo(
    () =>
      Array.isArray(userData?.addresses)
        ? userData.addresses.map((addr) =>
            mapSavedAddressForCheckout(addr, baseDisplayName, basePhone)
          )
        : [],
    [userData?.addresses, baseDisplayName, basePhone]
  );

  const preferredSavedAddress = useMemo(
    () =>
      mappedSavedAddresses.find((addr) => addr.isPrimary) ||
      mappedSavedAddresses[0] ||
      null,
    [mappedSavedAddresses]
  );

  const [formData, setFormData] = useState({
    fullName: baseDisplayName,
    email: baseEmail,
    alternateContactNumber: "",
  });

  const [shippingAddress, setShippingAddress] = useState({
    firstName: preferredSavedAddress?.firstName || parseName(baseDisplayName).firstName || "",
    lastName: preferredSavedAddress?.lastName || parseName(baseDisplayName).lastName || "",
    company: "",
    address1: preferredSavedAddress?.address1 || legacyUser?.address?.address1 || "",
    address2: preferredSavedAddress?.address2 || legacyUser?.address?.address2 || "",
    city: preferredSavedAddress?.city || legacyUser?.address?.city || "",
    country: preferredSavedAddress?.country || legacyUser?.address?.country || "India",
    zip: preferredSavedAddress?.zip || legacyUser?.address?.zip || "",
    province: preferredSavedAddress?.province || legacyUser?.address?.province || "",
    phone: preferredSavedAddress?.phone || normalizePhone(basePhone),
  });

  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  useEffect(() => {
    if (!activeUser) return;

    const latestDisplayName =
      userData?.displayName ||
      authUser?.displayName ||
      [legacyUser?.firstName, legacyUser?.lastName].filter(Boolean).join(" ") ||
      "";
    const latestEmail = userData?.email || authUser?.email || legacyUser?.email || "";
    const latestPhone = normalizePhone(
      userData?.phoneNumber || authUser?.phoneNumber || legacyUser?.phone || ""
    );

    const latestAddresses = Array.isArray(userData?.addresses)
      ? userData.addresses.map((addr) =>
          mapSavedAddressForCheckout(addr, latestDisplayName, latestPhone)
        )
      : [];
    const latestPreferredAddress =
      latestAddresses.find((addr) => addr.isPrimary) || latestAddresses[0] || null;
    const parsedName = parseName(latestDisplayName);

    setFormData((prev) => ({
      ...prev,
      fullName: latestDisplayName || prev.fullName,
      email: latestEmail || prev.email,
    }));

    setShippingAddress((prev) => ({
      ...prev,
      firstName: latestPreferredAddress?.firstName || parsedName.firstName || prev.firstName,
      lastName: latestPreferredAddress?.lastName || parsedName.lastName || prev.lastName,
      phone: latestPreferredAddress?.phone || latestPhone || prev.phone,
      ...(latestPreferredAddress
        ? {
            address1: latestPreferredAddress.address1,
            address2: latestPreferredAddress.address2,
            city: latestPreferredAddress.city,
            country: latestPreferredAddress.country,
            zip: latestPreferredAddress.zip,
            province: latestPreferredAddress.province,
          }
        : {}),
    }));
  }, [activeUser, authUser, legacyUser, userData]);

  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setError("Payment gateway is not configured. Please contact support.");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () =>
      setError("Failed to load payment processor. Please refresh the page.");
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingAddressSubmit = (address) => {
    setShippingAddress(address);
  };

  const updateAddress = async (token, addressId, addressData) => {
    if (!token) return;
    const response = await fetch("/api/update-address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token, addressId, address: addressData }),
    });
    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || "Failed to update address on server.");
    }
    return response.json();
  };

  const mappedCartPayload = () =>
    cart.map((item) => ({
      id: item.id,
      productId: item.productId || item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color,
      title: item.title,
      image: item.image,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!selectedShippingRate) throw new Error("Please save a valid shipping address first.");
      if (!formData.email) throw new Error("Email address is required.");
      if (!shippingAddress.phone) throw new Error("Phone number is required.");

      if (paymentMethod === "cod") {
        const advanceAmount = 150;
        const remainingAmount = Math.max(0, total - advanceAmount);

        const razorpayResponse = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: mappedCartPayload(),
            email: formData.email,
            shippingAddress,
            totalAmount: advanceAmount,
            selectedShippingRate,
            isGuestCheckout: !activeUser,
            paymentMethod: "cod",
            codAdvanceAmount: advanceAmount,
            codRemainingAmount: remainingAmount,
          }),
        });

        if (!razorpayResponse.ok) {
          const errorData = await razorpayResponse.json();
          throw new Error(errorData.error || "Payment initialization failed");
        }

        const { orderId: razorpayOrderId } = await razorpayResponse.json();

        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: advanceAmount * 100,
          currency: "INR",
          name: "Mystique Apparel",
          description: `COD Advance Payment (₹${remainingAmount} due on delivery)`,
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              setLoading(true);
              const orderResponse = await fetch("/api/create-sanity-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  cart: mappedCartPayload(),
                  email: formData.email,
                  shippingAddress: { ...shippingAddress, countryCode: "IN" },
                  shippingOption: {
                    title: selectedShippingRate.title,
                    price: selectedShippingRate.price,
                  },
                  paymentMethod: "cod",
                  advancePaid: advanceAmount,
                  remainingToPay: remainingAmount,
                  totalAmount: total,
                  discount: appliedDiscount,
                  isGuestCheckout: !activeUser,
                  customerName: formData.fullName,
                  firebaseUid: authUser?.uid || null,
                }),
              });

              if (!orderResponse.ok) {
                const errData = await orderResponse.json();
                throw new Error(errData.message || "Failed to create order");
              }

              const orderData = await orderResponse.json();
              setIsRedirecting(true);
              clearCart();
              router.push(`/order-confirmation?orderId=${orderData.orderId}`);
            } catch (err) {
              setError(err.message || "Failed to process your order");
              setLoading(false);
              setIsRedirecting(false);
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: shippingAddress.phone,
          },
          notes: {
            paymentMethod: "cod",
            advanceAmount,
            remainingAmount,
            totalAmount: total,
          },
        });

        rzp.open();
        return;
      }

      const razorpayResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: mappedCartPayload(),
          email: formData.email,
          shippingAddress,
          totalAmount: total,
          selectedShippingRate,
          isGuestCheckout: !activeUser,
        }),
      });

      if (!razorpayResponse.ok) {
        const errorData = await razorpayResponse.json();
        throw new Error(errorData.error || "Payment initialization failed");
      }

      const { orderId: razorpayOrderId, isFreeOrder } = await razorpayResponse.json();

      if (isFreeOrder || total === 0) {
        const orderResponse = await fetch("/api/create-sanity-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayPaymentId: null,
            razorpayOrderId,
            razorpaySignature: null,
            cart: mappedCartPayload(),
            email: formData.email,
            shippingAddress: { ...shippingAddress, countryCode: "IN" },
            shippingOption: {
              title: selectedShippingRate.title,
              price: selectedShippingRate.price,
              code: selectedShippingRate.code || "standard",
            },
            totalAmount: total,
            discount: appliedDiscount
              ? {
                  code: appliedDiscount.code,
                  amount: appliedDiscount.amount,
                  type: appliedDiscount.type,
                }
              : null,
            isGuestCheckout: !activeUser,
            isFreeOrder: true,
            customerName: formData.fullName,
            firebaseUid: authUser?.uid || null,
          }),
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.error || "Order creation failed");
        }

        const orderData = await orderResponse.json();
        setIsRedirecting(true);
        clearCart();
        router.push(`/order-confirmation?orderId=${orderData.orderId}`);
        return;
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "Mystique Apparel",
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            setLoading(true);
            const orderResponse = await fetch("/api/create-sanity-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                cart: mappedCartPayload(),
                email: formData.email,
                shippingAddress: { ...shippingAddress, countryCode: "IN" },
                shippingOption: {
                  title: selectedShippingRate.title,
                  price: selectedShippingRate.price,
                  code: selectedShippingRate.code || "standard",
                },
                totalAmount: total,
                discount: appliedDiscount
                  ? {
                      code: appliedDiscount.code,
                      amount: appliedDiscount.amount,
                      type: appliedDiscount.type,
                    }
                  : null,
                isGuestCheckout: !activeUser,
                customerName: formData.fullName,
                firebaseUid: authUser?.uid || null,
              }),
            });

            if (!orderResponse.ok) {
              const errorData = await orderResponse.json();
              throw new Error(errorData.error || "Order creation failed");
            }

            const orderData = await orderResponse.json();
            setIsRedirecting(true);
            clearCart();
            router.push(`/order-confirmation?orderId=${orderData.orderId}`);
          } catch (err) {
            setError(
              `Payment succeeded but order recording failed. Contact support with Payment ID: ${response.razorpay_payment_id}`
            );
            setLoading(false);
            setIsRedirecting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: shippingAddress.phone,
        },
        notes: {
          internalNote: activeUser
            ? "Created via web checkout (Logged in)"
            : "Created via web checkout (Guest)",
        },
      });

      rzp.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !isRedirecting) {
    return (
      <div className="min-h-[80vh] bg-[#F6F5F1] text-[#0D0D0D] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#0D0D0D]/12 p-10 rounded-[2px] text-center">
          <div className="w-14 h-14 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-5 h-5 text-[#64625C]" />
          </div>
          <h2 className="font-display italic text-3xl text-[#0D0D0D] mb-3">
            Your Bag Is Empty
          </h2>
          <p className="font-body text-sm text-[#64625C] mb-8">
            Add heavyweight essentials to your bag to continue to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#0D0D0D] text-[#F6F5F1] py-3.5 px-8 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-[#262626] transition-colors"
          >
            Explore The Archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Checkout Header & Steps */}
        <div className="mb-8 sm:mb-10 pb-8 border-b border-[#0D0D0D]/12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono-tech text-[10px] tracking-[0.32em] uppercase text-[#64625C] inline-flex items-center gap-2 mb-2.5">
              <Lock className="w-3 h-3 text-[#0D0D0D]" />
              Encrypted Checkout
            </span>
            <h1 className="font-display italic text-4xl sm:text-5xl font-semibold text-[#0D0D0D] tracking-[-0.015em]">
              Complete Your Order
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-5 font-mono-tech text-[10px] tracking-[0.2em] uppercase">
            <span className="text-[#0D0D0D] font-semibold">01 Contact</span>
            <span className="w-5 h-px bg-[#0D0D0D]/20" />
            <span className={selectedShippingRate ? "text-[#0D0D0D] font-semibold" : "text-[#64625C]"}>
              02 Delivery
            </span>
            <span className="w-5 h-px bg-[#0D0D0D]/20" />
            <span className={selectedShippingRate ? "text-[#0D0D0D] font-semibold" : "text-[#64625C]"}>
              03 Payment
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-[2px] bg-[#991B1B]/6 border border-[#991B1B]/25 text-[#991B1B] flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-5">
            <UserInformationForm
              formData={formData}
              handleChange={handleChange}
              user={activeUser}
            />

            <ShippingAddressForm
              updateAddress={updateAddress}
              user={activeUser}
              initialAddress={preferredSavedAddress}
              initialAddresses={mappedSavedAddresses}
              onSubmit={handleShippingAddressSubmit}
            />

            <ShippingOptions
              shippingRates={shippingRates}
              setShippingRates={setShippingRates}
              selectedShippingRate={selectedShippingRate}
              setSelectedShippingRate={setSelectedShippingRate}
              shippingAddress={shippingAddress}
              cart={cart}
            />

            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
            <OrderSummary
              cart={cart}
              selectedShippingRate={selectedShippingRate}
              setTotal={setTotal}
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              appliedDiscount={appliedDiscount}
              setAppliedDiscount={setAppliedDiscount}
              discountError={discountError}
              setDiscountError={setDiscountError}
              applyingDiscount={applyingDiscount}
              setApplyingDiscount={setApplyingDiscount}
              paymentMethod={paymentMethod}
            />

            <PaymentButton
              loading={loading || isRedirecting}
              selectedShippingRate={selectedShippingRate}
              onClick={handleSubmit}
              cart={cart}
              razorpayLoaded={razorpayLoaded}
              paymentMethod={paymentMethod}
              totalAmount={total}
            />
          </div>
        </div>
      </div>

      {/* Redirecting Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0A0A0A]/70 px-4">
          <div className="bg-white border border-[#0D0D0D]/15 rounded-[2px] p-10 max-w-sm w-full text-center space-y-4">
            <Loader2 className="w-8 h-8 text-[#0D0D0D] animate-spin mx-auto" />
            <h3 className="font-display italic text-2xl text-[#0D0D0D]">
              Order Confirmed
            </h3>
            <p className="font-body text-xs text-[#64625C]">
              Preparing your atelier receipt and confirmation details...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
