// app/account/orders/[orderId]/page.js

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, Truck, CreditCard, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";

const OrderDetailsPage = ({ params }) => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams?.orderId;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) throw new Error("Missing order ID");

        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order");
        }
        
        const data = await response.json();
        if (!data) throw new Error("Order data not found");
        
        setOrderDetails(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-white text-black px-6 py-3 rounded-lg font-medium inline-block hover:bg-gray-200 transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button and header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Orders
          </button>
          
          <h1 className="text-3xl font-extrabold mb-2">
            Order #{orderDetails?.orderNumber}
          </h1>
          <p className="text-gray-400">
            Placed on {formatDate(orderDetails?.createdAt)}
          </p>
        </div>

        {/* Order status indicator */}
        <div className="bg-gray-900 rounded-xl p-4 mb-8 border border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${
              orderDetails?.paymentStatus === 'paid' ? 'bg-green-500' :
              orderDetails?.paymentStatus === 'pending' ? 'bg-yellow-500' :
              orderDetails?.paymentStatus === 'cancelled' ? 'bg-red-500' :
              'bg-gray-500'
            }`}></div>
            <span className="capitalize">
              {orderDetails?.paymentStatus?.replace(/_/g, ' ').toLowerCase()}
            </span>
          </div>
          {orderDetails?.trackingInfo && (
            <a
              href={orderDetails.trackingInfo.trackingUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline text-sm"
            >
              Track Package
            </a>
          )}
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Details Card */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method</span>
                <span className="capitalize">
                  {orderDetails?.paymentMethod || 'Not specified'}
                </span>
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
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Address</span>
                  <div className="text-right">
                    <div>{orderDetails?.shippingAddress?.firstName} {orderDetails?.shippingAddress?.lastName}</div>
                    <div className="text-gray-400 text-sm">
                      {orderDetails?.shippingAddress?.address1}
                    </div>
                  </div>
                </div>
                
                {orderDetails?.trackingInfo ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tracking</span>
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
                      <span className="capitalize">
                        {orderDetails.trackingInfo.status || 'Processing'}
                      </span>
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
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="divide-y divide-gray-800">
            {orderDetails?.items?.map((item) => (
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
                  <p className="text-sm text-gray-400 mt-1">
                    ₹{item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-800 pt-4 mt-4">
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Subtotal</span>
              <span>₹{orderDetails?.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Shipping</span>
              <span>{requiresShipping ? 'Calculated at checkout' : 'Free'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Tax</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between pt-4 font-bold text-lg border-t border-gray-800">
              <span>Total</span>
              <span>₹{orderDetails?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {orderDetails?.invoiceUrl ? (
  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
    <h2 className="text-xl font-bold mb-4">Order Invoice</h2>
    <div className="flex flex-col space-y-4">
      <iframe 
        src={orderDetails.invoiceUrl}
        className="w-full h-[600px] border border-gray-700 rounded-lg"
        title="Shopify Invoice"
        loading="lazy"
      />
      <div className="flex gap-4">
        <a
          href={orderDetails.invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Open Full Invoice
        </a>
        <button 
          onClick={() => window.open(orderDetails.invoiceUrl, '_blank')?.print()}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Print Invoice
        </button>
      </div>
    </div>
  </div>
) : (
  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
    <p className="text-gray-400">Invoice not available for this order</p>
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
            href="/products" 
            className="bg-white text-black px-8 py-3 rounded-lg font-medium inline-block hover:bg-gray-200 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;