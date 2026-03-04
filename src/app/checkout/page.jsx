// app/checkout/page.jsx (or wherever your CheckoutPage component is)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import UserInformationForm from "@/components/checkout/UserInformationForm";
import ShippingAddressForm from "@/components/checkout/ShippingAddressForm";
import ShippingOptions from "@/components/checkout/ShippingOptions";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentButton from "@/components/checkout/PaymentButton";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import Link from "next/link";

const CheckoutPage = () => {
  const { cart } = useCart();
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

  // Generate stable hash from address content
  const generateAddressHash = (addr) => {
    const content = `${addr.firstName || ''}-${addr.lastName || ''}-${addr.address1 || ''}-${addr.city || ''}-${addr.zip || ''}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `addr-${Math.abs(hash).toString(36)}`;
  };

  const mapSavedAddressForCheckout = (addr = {}, fallbackName = "", fallbackPhone = "") => {
    const parsedName = parseName(addr.name || fallbackName);
    const firstName = addr.firstName || parsedName.firstName || "";
    const lastName = addr.lastName || parsedName.lastName || "";

    // Ensure unique, stable ID - use _key if available, otherwise generate from content hash
    const uniqueId = addr.id || addr._key || generateAddressHash({ firstName, lastName, address1: addr.address1 || addr.street || "", city: addr.city || "", zip: addr.zip || addr.postalCode || "" });

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
        ? userData.addresses.map((addr) => mapSavedAddressForCheckout(addr, baseDisplayName, basePhone))
        : [],
    [userData?.addresses, baseDisplayName, basePhone]
  );

  const preferredSavedAddress = useMemo(
    () => mappedSavedAddresses.find((addr) => addr.isPrimary) || mappedSavedAddresses[0] || null,
    [mappedSavedAddresses]
  );

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

  // Sync form data when user changes (relevant only if user logs in during the session)
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
      ? userData.addresses.map((addr) => mapSavedAddressForCheckout(addr, latestDisplayName, latestPhone))
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
  
      // Handle COD payment method
      if (paymentMethod === "cod") {
        // For COD, charge ₹150 advance
        const advanceAmount = 150;
        const remainingAmount = total - advanceAmount;
        
        // Create Razorpay order for advance payment
        const razorpayResponse = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: cart.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
              color: item.color,
              title: item.title,
              image: item.image
            })),
            email: formData.email,
            shippingAddress,
            totalAmount: advanceAmount, // Only advance payment through Razorpay
            selectedShippingRate,
            isGuestCheckout: !activeUser,
            paymentMethod: "cod",
            codAdvanceAmount: advanceAmount,
            codRemainingAmount: remainingAmount
          }),
        });

        if (!razorpayResponse.ok) {
          const errorData = await razorpayResponse.json();
          throw new Error(errorData.error || "Payment initialization failed");
        }

        const { orderId: razorpayOrderId } = await razorpayResponse.json();

        // Initialize Razorpay payment for advance
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: advanceAmount * 100, // ₹150 advance in paise
          currency: "INR",
          name: "Mystique Apparel",
          description: `COD Advance Payment (₹${remainingAmount} remaining on delivery)`,
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              setLoading(true);
              
              // Create Sanity order with COD details
              const orderResponse = await fetch("/api/create-sanity-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  cart: cart.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size,
                    color: item.color,
                    title: item.title,
                    image: item.image
                  })),
                  email: formData.email,
                  shippingAddress: {
                    ...shippingAddress,
                    countryCode: 'IN'
                  },
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
                const error = await orderResponse.json();
                throw new Error(error.message || "Failed to create order");
              }

              const orderData = await orderResponse.json();
              console.log('Order created successfully:', orderData);
              
              // Clear cart and redirect
              router.push(`/order-confirmation?orderId=${orderData.orderId}`);
            } catch (error) {
              console.error("Order creation error:", error);
              setError(error.message || "Failed to process your order");
              setLoading(false);
            }
          },
          prefill: {
            email: formData.email,
            contact: shippingAddress.phone
          },
          notes: {
            paymentMethod: "cod",
            advanceAmount,
            remainingAmount,
            totalAmount: total
          }
        });

        rzp.open();
        return;
      }
  
      // Handle Razorpay payment (full amount) or free orders
      const razorpayResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
            title: item.title,
            image: item.image
          })),
          email: formData.email,
          shippingAddress,
          totalAmount: total,
          selectedShippingRate,
          // You might want to pass a flag to your backend to indicate guest checkout
          isGuestCheckout: !activeUser, 
        }),
      });
  
      if (!razorpayResponse.ok) {
        const errorData = await razorpayResponse.json();
        throw new Error(errorData.error || "Payment initialization failed");
      }
  
      const { orderId: razorpayOrderId, isFreeOrder } = await razorpayResponse.json();
  
      // For 0 amount orders, skip Razorpay and create order directly
      if (isFreeOrder || total === 0) {
        try {
          const orderResponse = await fetch("/api/create-sanity-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayPaymentId: null,
              razorpayOrderId,
              razorpaySignature: null,
              cart: cart.map(item => ({
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
                color: item.color,
                title: item.title,
                image: item.image
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
              discount: appliedDiscount ? {
                code: appliedDiscount.code,
                amount: appliedDiscount.amount,
                type: appliedDiscount.type
              } : null,
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
          router.push(`/order-confirmation?orderId=${orderData.orderId}`);
          return;
        } catch (error) {
          console.error("Free order creation error:", error);
          setError(error.message || "Failed to create order");
          setLoading(false);
          return;
        }
      }
  
      // Initialize Razorpay payment for non-zero amounts
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100, // Razorpay expects amount in paise
        currency: "INR",
        name: "Mystique Apparel",
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            setLoading(true);
            
            // Create Sanity order
            const orderResponse = await fetch("/api/create-sanity-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                cart: cart.map(item => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                  price: item.price,
                  size: item.size,
                  color: item.color,
                  title: item.title,
                  image: item.image
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
                discount: appliedDiscount ? {
                  code: appliedDiscount.code,
                  amount: appliedDiscount.amount,
                  type: appliedDiscount.type
                } : null,
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
            internalNote: activeUser ? "Created via web checkout (Logged in)" : "Created via web checkout (Guest)"
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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-gradient-to-br from-gray-900/50 to-black border border-gray-700/50 p-6 sm:p-8 md:p-10 rounded-xl backdrop-blur shadow-2xl">
          <div className="text-center">
            <div className="inline-block p-4 sm:p-5 md:p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-4 sm:mb-6">
              <svg className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Your Cart is Empty</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">Add some amazing products to get started with your order.</p>
            <Link 
              href="/shop" 
              className="inline-block bg-gradient-to-r from-white to-gray-200 text-black py-2.5 sm:py-3 md:py-3.5 px-6 sm:px-8 rounded-lg font-semibold hover:from-gray-100 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-black via-black/95 to-black border-b border-gray-800/50 sticky top-0 z-40 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-1">
            Secure Checkout
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 text-center">
            Complete your order with confidence
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-5 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-500/50 backdrop-blur text-red-200 p-2.5 sm:p-3.5 rounded-lg mb-4 sm:mb-6 max-w-5xl mx-auto shadow-lg shadow-red-500/10">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <svg className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 flex-shrink-0 mt-0.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-medium text-xs sm:text-sm md:text-base">{error}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-7 max-w-7xl mx-auto">
        {/* Left Column - Forms */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4 md:space-y-5">
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

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
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
            
            <div className="mt-3 sm:mt-4 md:mt-5">
              <PaymentButton
                loading={loading}
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
      </div>
      </div>
    </div>
  );
};

export default CheckoutPage;