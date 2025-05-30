// app/checkout/page.jsx (or wherever your CheckoutPage component is)

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
  const { user } = useUser();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
      return;
    }
    // Removed the !user redirect to /account/login
    // Users can now proceed as guests
  }, [cart, router]);

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

  // Sync form data when user changes (relevant only if user logs in during the session)
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
    // Load Razorpay script regardless of user login status for guest checkout
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
  }, []); // Removed 'user' from dependency array to allow script to load for guests

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

  // The updateAddress function is primarily for logged-in users to save addresses.
  // For guest users, this function won't be called, or it should handle a null token gracefully.
  const updateAddress = async (token, addressId, addressData) => {
    try {
      // For guest checkout, there won't be a token, so skip the API call to update address.
      // The address will just be used for this order.
      if (!token) {
        console.log("No token provided for address update. Proceeding as guest.");
        return; // Or handle guest address saving if that's a desired feature
      }
      
      console.log("Sending update request with:", { token, addressId, address: addressData });

      const response = await fetch("/api/update-address", {
        method: "POST", // Or PUT if your API is idempotent for updates
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the token in the header
        },
        // Send addressId and the actual address data
        body: JSON.stringify({ token, addressId, address: addressData }), 
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || "Failed to update address on server.");
      }
      console.log("Address updated successfully!");
      return response.json(); // Return the response data if needed
    } catch (error) {
      console.error("Error updating address:", error);
      throw error; // Re-throw to be caught by ShippingAddressForm
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Removed the !user check here, allowing guests to proceed
    // The previous check forced login, now it's optional.
    
    setLoading(true);
    setError("");
  
    try {
      // Validate inputs (still required for guests)
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
          selectedShippingRate,
          // You might want to pass a flag to your backend to indicate guest checkout
          isGuestCheckout: !user, 
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
        name: "Mystique Apparel",
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
                totalAmount: total,
                isGuestCheckout: !user, // Pass this flag to the order creation API as well
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
          internalNote: user ? "Created via web checkout (Logged in)" : "Created via web checkout (Guest)"
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

  // Removed the entire `if (!user)` block.
  // Users can now proceed to the form directly.

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
          user={user} // Still pass user, but component should adapt
        />
        <ShippingAddressForm
          updateAddress={updateAddress} 
          user={user} // Still pass user, but component should adapt for guests
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