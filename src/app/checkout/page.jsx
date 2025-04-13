"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import UserInformationForm from "@/components/checkout/UserInformationForm";
import ShippingAddressForm from "@/components/checkout/ShippingAddressForm";
import ShippingOptions from "@/components/checkout/ShippingOptions";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentButton from "@/components/checkout/PaymentButton";
import { validateEmail, validatePhoneNumber } from "@/utils/validation";

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useUser();
  const router = useRouter();

  // Form state with better structure
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

  const [status, setStatus] = useState({
    loading: false,
    currentStep: 'form', // form → payment → order
    error: null
  });

  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  // Load any pending orders from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('pendingOrder');
    if (savedOrder) {
      setPendingOrder(JSON.parse(savedOrder));
    }
  }, []);

  // Improved Razorpay script loading
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.id = "razorpay-script";
    
    script.onload = () => {
      if (!window.Razorpay) {
        setStatus(prev => ({
          ...prev,
          error: "Payment system failed to initialize"
        }));
        return;
      }
      setRazorpayLoaded(true);
    };

    script.onerror = () => {
      setStatus(prev => ({
        ...prev,
        error: "Failed to load payment processor"
      }));
    };

    document.body.appendChild(script);

    return () => {
      const script = document.getElementById("razorpay-script");
      if (script) document.body.removeChild(script);
    };
  }, []);

  // Validate form fields with better checks
  const validateForm = useCallback(() => {
    const errors = [];

    if (!formData.fullName?.trim()) errors.push("Full name is required");
    if (!formData.email?.trim()) {
      errors.push("Email is required");
    } else if (!validateEmail(formData.email)) {
      errors.push("Please enter a valid email");
    }

    if (!shippingAddress.firstName?.trim()) errors.push("First name is required");
    if (!shippingAddress.lastName?.trim()) errors.push("Last name is required");
    if (!shippingAddress.address1?.trim()) errors.push("Address is required");
    if (!shippingAddress.city?.trim()) errors.push("City is required");
    if (!shippingAddress.zip?.trim()) errors.push("ZIP code is required");
    
    if (!shippingAddress.phone?.trim()) {
      errors.push("Phone number is required");
    } else if (!validatePhoneNumber(shippingAddress.phone)) {
      errors.push("Please enter a valid phone number");
    }

    if (!selectedShippingRate) errors.push("Please select a shipping method");
    if (cart.length === 0) errors.push("Your cart is empty");

    if (errors.length > 0) {
      throw new Error(errors.join(". "));
    }
  }, [formData, shippingAddress, selectedShippingRate, cart]);

  // Handle successful payment
  const handlePaymentSuccess = useCallback(async (paymentResponse) => {
    try {
      setStatus(prev => ({ ...prev, currentStep: 'order', loading: true }));

      const orderData = {
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpaySignature: paymentResponse.razorpay_signature,
        cart,
        email: formData.email,
        shippingAddress,
      };

      const response = await fetch("/api/create-shopify-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Order creation failed");
      }

      // Clear pending order and cart on success
      localStorage.removeItem('pendingOrder');
      clearCart();
      router.push("/order-confirmation");
    } catch (error) {
      console.error("Order creation error:", error);
      
      // Save order data for recovery
      const failedOrder = {
        paymentResponse,
        cart,
        formData,
        shippingAddress,
        timestamp: new Date().toISOString(),
        retryCount: (pendingOrder?.retryCount || 0) + 1
      };

      localStorage.setItem('pendingOrder', JSON.stringify(failedOrder));
      setPendingOrder(failedOrder);

      setStatus(prev => ({
        ...prev,
        error: `Payment succeeded but order failed: ${error.message}`,
        loading: false
      }));
    }
  }, [cart, formData, shippingAddress, router, clearCart, pendingOrder]);

  // Retry failed order
  const retryPendingOrder = useCallback(async () => {
    if (!pendingOrder) return;
    
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      await handlePaymentSuccess(pendingOrder.paymentResponse);
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: `Retry failed: ${error.message}`,
        loading: false
      }));
    }
  }, [pendingOrder, handlePaymentSuccess]);

  // Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setStatus({
        loading: true,
        currentStep: 'form',
        error: null
      });

      validateForm();

      if (!razorpayLoaded) {
        throw new Error("Payment system initializing. Please wait...");
      }

      // Get order details from server
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          email: formData.email,
          shippingAddress,
          selectedShippingRate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment setup failed");
      }

      const { orderId, amount, currency } = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Mystique Apparel",
        description: `Order for ${formData.email}`,
        order_id: orderId,
        handler: handlePaymentSuccess,
        prefill: {
          name: formData.fullName || `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: formData.email,
          contact: shippingAddress.phone,
        },
        notes: {
          address: JSON.stringify(shippingAddress),
          cart: JSON.stringify(cart)
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on("payment.failed", (response) => {
        setStatus(prev => ({
          ...prev,
          error: `Payment failed: ${response.error.description}`,
          loading: false
        }));
      });

      rzp.open();
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 bg-black text-white">
      <h1 className="text-4xl font-extrabold text-white text-center mb-12">Checkout</h1>
      
      {/* Pending order recovery */}
      {pendingOrder && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-6">
          <p className="font-medium">Your payment was processed but order completion failed.</p>
          <div className="mt-2 flex gap-4">
            <button
              onClick={retryPendingOrder}
              disabled={status.loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {status.loading ? 'Processing...' : 'Retry Order Completion'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('pendingOrder');
                setPendingOrder(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {status.error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          <p className="font-medium">{status.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UserInformationForm 
          formData={formData} 
          onChange={(e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
          }} 
          disabled={status.loading}
        />
        
        <ShippingAddressForm
          formData={shippingAddress}
          onChange={(e) => {
            const { name, value } = e.target;
            setShippingAddress(prev => ({ ...prev, [name]: value }));
          }}
          disabled={status.loading}
        />
        
        <ShippingOptions
          shippingRates={shippingRates}
          selectedShippingRate={selectedShippingRate}
          onSelectRate={setSelectedShippingRate}
          disabled={status.loading}
        />
        
        <OrderSummary 
          cart={cart} 
          shippingRate={selectedShippingRate} 
        />
        
        <PaymentButton
          loading={status.loading}
          disabled={!selectedShippingRate || !razorpayLoaded || status.loading}
        />
      </form>
    </div>
  );
};

export default CheckoutPage;