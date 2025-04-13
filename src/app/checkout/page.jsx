"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import UserInformationForm from "@/components/checkout/UserInformationForm";
import ShippingAddressForm from "@/components/checkout/ShippingAddressForm";
import ShippingOptions from "@/components/checkout/ShippingOptions";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentButton from "@/components/checkout/PaymentButton";

const CheckoutPage = () => {
  const { cart } = useCart();
  const { user } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    alternateContactNumber: "",
  });

  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    company: "",
    address1: user?.address?.address1 || "",
    address2: user?.address?.address2 || "",
    city: user?.address?.city || "",
    country: user?.address?.country || "India",
    zip: user?.address?.zip || "",
    province: user?.address?.province || "",
    phone: user?.phone || "",
  });

  const [loading, setLoading] = useState(false);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.error("Missing Razorpay key ID in env");
      setError("Payment system error. Please contact support.");
      return;
    }    
  
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded");
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      setError("Failed to load payment processor. Please refresh the page.");
    };
    document.body.appendChild(script);
  
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingAddressSubmit = (address) => {
    setShippingAddress(address);
  };

  const updateAddress = async (address) => {
    try {
      const token = localStorage.getItem("shopifyAccessToken");
      const response = await fetch("/api/update-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error("Failed to update address");
      }

      const data = await response.json();
      console.log("Address updated successfully:", data);
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (
      !formData.fullName ||
      !formData.email ||
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.address1 ||
      !shippingAddress.city ||
      !shippingAddress.province ||
      !shippingAddress.zip ||
      !shippingAddress.phone
    ) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    if (!window.Razorpay || !razorpayLoaded) {
      setError("Payment system not ready. Please wait...");
      setLoading(false);
      return;
    }

    try {
      const razorpayResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          email: formData.email,
          shippingAddress,
          totalAmount: cart.reduce((total, item) => total + item.price * item.quantity, 0) + (selectedShippingRate?.price || 0),
          selectedShippingRate,
        }),
      });

      if (!razorpayResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const razorpayData = await razorpayResponse.json();
      console.log("Razorpay Data:", razorpayData);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayData.amount,
        currency: "INR",
        name: "Mystique Apparel",
        description: "Payment for your order",
        order_id: razorpayData.orderId,
        handler: async (response) => {
          try {
            const checkoutResponse = await fetch("/api/create-shopify-checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                cart,
                email: formData.email,
                shippingAddress,
              }),
            });

            if (!checkoutResponse.ok) {
              throw new Error("Failed to create Shopify order");
            }

            router.push("/order-confirmation");
          } catch (error) {
            console.error("Order creation error:", error);
            setError("Order creation failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.fullName || `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: formData.email,
          contact: shippingAddress.phone,
        },
        notes: {
          address: `${shippingAddress.address1}, ${shippingAddress.address2}, ${shippingAddress.city}, ${shippingAddress.country}, ${shippingAddress.zip}`,
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 bg-black text-white">
      <h1 className="text-4xl font-extrabold text-white text-center mb-12">Checkout</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UserInformationForm formData={formData} handleChange={handleChange} user={user} />
        <ShippingAddressForm
          formData={shippingAddress}
          handleChange={handleShippingAddressChange}
          user={user}
          updateAddress={updateAddress}
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
        <OrderSummary cart={cart} selectedShippingRate={selectedShippingRate} />
        <PaymentButton
          loading={loading}
          selectedShippingRate={selectedShippingRate}
          onClick={handleSubmit}
          cart={cart}
          razorpayLoaded={razorpayLoaded}
        />
      </form>
    </div>
  );
};

export default CheckoutPage;