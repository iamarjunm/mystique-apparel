"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, Truck, CreditCard, Package, Download } from "lucide-react";
import Link from "next/link";

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center">
    <div className="text-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-400" />
      <h1 className="text-2xl font-bold">Loading your order details</h1>
      <p className="text-gray-400">Please wait while we fetch your order</p>
    </div>
  </div>
);

// Error component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
    <div className="max-w-md text-center space-y-6">
      <div className="space-y-2">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="text-gray-400">{error}</p>
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={onRetry}
          className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Try Again
        </button>
        <Link 
          href="/" 
          className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  </div>
);

// Main order content component
const OrderContent = ({ orderDetails }) => {
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    const downloadInvoice = async () => {
      try {
        setDownloadingPDF(true);
        const response = await fetch(`/api/generate-invoice?orderId=${orderDetails.orderNumber}`);
      
        if (!response.ok) {
          throw new Error('Failed to generate invoice');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${orderDetails.orderNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to download invoice:', error);
        alert('Failed to download invoice. Please try again or contact support.');
      } finally {
        setDownloadingPDF(false);
      }
    };

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
          
                  {/* Download Invoice Button */}
                  <div className="mt-6">
                    <button
                      onClick={downloadInvoice}
                      disabled={downloadingPDF}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingPDF ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Generating Invoice...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5" />
                          Download Invoice
                        </>
                      )}
                    </button>
                  </div>
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
              
              {/* Price Breakdown */}
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>₹{orderDetails?.subtotal?.toFixed(2)}</span>
                </div>
                {orderDetails?.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span>₹{orderDetails?.shippingCost?.toFixed(2)}</span>
                  </div>
                )}
                {!orderDetails?.shippingCost && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                )}
                {orderDetails?.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Discount{orderDetails?.discountCode ? ` (${orderDetails.discountCode})` : ''}</span>
                    <span>-₹{orderDetails?.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-700 mt-3">
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

// Main page component with Suspense boundary
const OrderConfirmationPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrderConfirmationContent />
    </Suspense>
  );
};

// Inner component that uses useSearchParams
const OrderConfirmationContent = () => {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderId = searchParams.get("orderId");
        if (!orderId) throw new Error("Missing order ID");
        
        const data = await fetchOrderDetails(orderId);
        setOrderDetails(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [searchParams]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const orderId = searchParams.get("orderId");
    if (orderId) {
      fetchOrderDetails(orderId)
        .then(setOrderDetails)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={handleRetry} />;
  if (!orderDetails) return <ErrorDisplay error="No order data found" onRetry={handleRetry} />;

  return <OrderContent orderDetails={orderDetails} />;
};

export default OrderConfirmationPage;