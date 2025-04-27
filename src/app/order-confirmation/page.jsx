"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, Truck, CreditCard, Package } from "lucide-react";
import Link from "next/link";

const OrderConfirmationPage = () => {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderId = searchParams.get("orderId");
        if (!orderId) throw new Error("Missing order ID");

        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error("Failed to fetch order");
        
        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Date not available";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-400" />
          <h1 className="text-2xl font-bold">Loading your order details</h1>
          <p className="text-gray-400">Please wait while we fetch your order</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="space-y-2">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold">Order Not Found</h1>
            <p className="text-gray-400">{error}</p>
          </div>
          <Link 
            href="/" 
            className="bg-white text-black px-6 py-3 rounded-lg font-medium inline-block hover:bg-gray-200 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const requiresShipping = orderDetails?.shippingMethod && 
                         orderDetails.shippingMethod.toLowerCase() !== "no shipping";

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Confirmation Header */}
        <div className="text-center mb-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold mb-3">Order Confirmed!</h1>
          <p className="text-xl text-gray-400">
            Your order #{orderDetails?.orderNumber} has been received
          </p>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Details Card */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Order Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Number</span>
                <span className="font-mono">#{orderDetails?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date</span>
                <span>{formatDate(orderDetails?.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Status</span>
                <span className="capitalize">
                  {orderDetails?.paymentStatus?.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-800">
                <span className="text-gray-400">Total Amount</span>
                <span className="font-bold text-lg">₹{orderDetails?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping/Delivery Card */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {requiresShipping ? <Truck className="h-5 w-5" /> : <Package className="h-5 w-5" />}
              {requiresShipping ? "Shipping Info" : "Delivery Info"}
            </h2>
            
            {requiresShipping ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Method</span>
                  <span>{orderDetails?.shippingMethod}</span>
                </div>
                
                {orderDetails?.trackingInfo ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tracking Number</span>
                      <a 
                        href={orderDetails.trackingInfo.trackingUrl || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {orderDetails.trackingInfo.trackingId}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className="capitalize">{orderDetails.trackingInfo.status}</span>
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-gray-400">
                    Your shipping details will be updated soon
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-gray-400">This is a digital order</div>
                <div className="pt-2 text-sm text-gray-500">
                  You'll receive access details via email
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {orderDetails?.items?.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
            <h2 className="text-xl font-bold mb-4">Your Items</h2>
            <div className="divide-y divide-gray-800">
              {orderDetails.items.map((item) => (
                <div key={item.id} className="py-4 flex items-center">
                  <div className="bg-gray-800 rounded-md w-16 h-16 flex-shrink-0 mr-4 overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-400">
                      {item.variant && `${item.variant} • `}Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Support Note */}
        <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/50 mb-8">
          <h2 className="text-xl font-bold mb-2">Need Help?</h2>
          <p className="text-gray-400 mb-4">
            If you have any questions about your order, please contact our support team.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition"
          >
            Contact Support
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Continue Shopping Button */}
        <div className="text-center">
          <Link 
            href="/" 
            className="bg-white text-black px-8 py-3 rounded-lg font-medium inline-block hover:bg-gray-200 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;