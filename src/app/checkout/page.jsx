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
import Link from "next/link";

const CheckoutPage = () => {
  const { cart } = useCart();
  const { user, isAuthenticated } = useUser();
  const router = useRouter();

  // Redirect if cart is empty or user not logged in
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
      return;
    }

    if (!isAuthenticated) {
      // Store intended path for after login
      sessionStorage.setItem('checkoutRedirect', '/checkout');
      router.push("/account/login");
    }
  }, [cart, isAuthenticated, router]);

  // Initialize form data with user information if available
  const [formData, setFormData] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : "",
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
  const [total, setTotal] = useState(0);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Sync form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email || prev.email
      }));
      
      setShippingAddress(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        phone: user.phone || prev.phone,
        ...(user.address ? {
          address1: user.address.address1,
          address2: user.address.address2,
          city: user.address.city,
          country: user.address.country,
          zip: user.address.zip,
          province: user.address.province
        } : {})
      }));
    }
  }, [user]);
  

  useEffect(() => {
    if (!isAuthenticated) return; // Don't load payment if not authenticated
    
    // Load Razorpay script
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
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      setError("Failed to load payment processor. Please refresh the page.");
    };
    document.body.appendChild(script);
  
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
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
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError("Please login to complete your purchase");
      sessionStorage.setItem('checkoutRedirect', '/checkout');
      router.push("/account/login");
      return;
    }
    
    setLoading(true);
    setError("");
  
    try {
      // Validate inputs
      if (!selectedShippingRate) throw new Error("Please select shipping method");
      if (!formData.email) throw new Error("Email is required");
      if (!shippingAddress.phone) throw new Error("Phone number is required");
  
      // Create Razorpay order
      const razorpayResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          })),
          email: formData.email,
          shippingAddress,
          totalAmount: total,
          selectedShippingRate
        }),
      });
  
      if (!razorpayResponse.ok) {
        const errorData = await razorpayResponse.json();
        throw new Error(errorData.error || "Payment initialization failed");
      }
  
      const { orderId: razorpayOrderId } = await razorpayResponse.json();
  
      // Initialize Razorpay payment
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100, // Razorpay expects amount in paise
        currency: "INR",
        name: "Your Store Name",
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            setLoading(true);
            
            // Create Shopify order
            const orderResponse = await fetch("/api/create-shopify-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                cart: cart.map(item => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                  price: item.price
                })),
                email: formData.email,
                shippingAddress: {
                  ...shippingAddress,
                  countryCode: 'IN'
                },
                shippingOption: {
                  title: selectedShippingRate.title,
                  price: selectedShippingRate.price,
                  code: selectedShippingRate.code || 'standard'
                },
                totalAmount: total
              }),
            });
  
            if (!orderResponse.ok) {
              const errorData = await orderResponse.json();
              throw new Error(errorData.error || "Order creation failed");
            }
  
            const orderData = await orderResponse.json();
            router.push(`/order-confirmation?orderId=${orderData.orderId}`);
            
          } catch (error) {
            console.error("Order processing error:", error);
            setError(`Payment succeeded but order failed. Contact support with ID: ${response.razorpay_payment_id}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: shippingAddress.phone,
        },
        notes: {
          internalNote: "Created via web checkout"
        }
      });
  
      rzp.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}`);
      });
  
      rzp.open();
  
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12 bg-black text-white text-center">
        <div className="max-w-md mx-auto bg-black/40 p-8 rounded-lg border border-white/10">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="mb-6">You need to be logged in to proceed with checkout.</p>
          <div className="flex flex-col gap-4">
            <Link 
              href="/account/login" 
              className="bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              onClick={() => sessionStorage.setItem('checkoutRedirect', '/checkout')}
            >
              Login
            </Link>
            <Link 
              href="/account/register" 
              className="border border-white py-3 px-6 rounded-lg font-medium hover:bg-white/10 transition-colors"
              onClick={() => sessionStorage.setItem('checkoutRedirect', '/checkout')}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12 bg-black text-white text-center">
        <div className="max-w-md mx-auto bg-black/40 p-8 rounded-lg border border-white/10">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="mb-6">Add some products to your cart before checking out.</p>
          <Link 
            href="/shop" 
            className="bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 bg-black text-white">
      <h1 className="text-4xl font-extrabold text-white text-center mb-12">Checkout</h1>
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UserInformationForm 
          formData={formData} 
          handleChange={handleChange} 
          user={user} 
        />
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
      
        <OrderSummary 
          cart={cart} 
          selectedShippingRate={selectedShippingRate} 
          setTotal={setTotal}
        />
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