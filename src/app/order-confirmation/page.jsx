"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Package,
  Download,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import formatCurrency from "@/lib/formatCurrency";
import { toast } from "react-toastify";

const LoadingSpinner = () => (
  <div className="min-h-[80vh] bg-[#F6F5F1] text-[#0D0D0D] flex items-center justify-center px-4">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#0D0D0D]" />
      <h1 className="font-display italic text-2xl">Retrieving Your Dossier</h1>
      <p className="font-body text-xs text-[#64625C]">
        Fetching your confirmed order details...
      </p>
    </div>
  </div>
);

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-[80vh] bg-[#F6F5F1] text-[#0D0D0D] flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white border border-[#0D0D0D]/12 rounded-[2px] p-10 text-center space-y-6">
      <AlertCircle className="h-10 w-10 text-[#991B1B] mx-auto" />
      <div>
        <h1 className="font-display italic text-3xl text-[#0D0D0D] mb-2">
          Order Not Found
        </h1>
        <p className="font-body text-sm text-[#64625C]">{error}</p>
      </div>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="bg-[#0D0D0D] text-[#F6F5F1] px-6 py-3 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-[#262626] transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-[2px] border border-[#0D0D0D]/25 text-[#0D0D0D] hover:border-[#0D0D0D] font-body text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  </div>
);

const OrderContent = ({ orderDetails }) => {
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const downloadInvoice = async () => {
    try {
      setDownloadingPDF(true);
      const response = await fetch(
        `/api/generate-invoice?orderId=${orderDetails.orderNumber}`
      );
      if (!response.ok) throw new Error("Failed to generate invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${orderDetails.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently placed";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently placed";
    }
  };

  const requiresShipping =
    orderDetails?.shippingMethod &&
    orderDetails.shippingMethod.toLowerCase() !== "no shipping";

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-14 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Confirmation Banner */}
        <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-8 sm:p-12 text-center mb-8">
          <div className="w-14 h-14 rounded-[2px] bg-[#1A5D3A]/10 border border-[#1A5D3A]/25 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-7 w-7 text-[#1A5D3A]" />
          </div>
          <span className="font-mono-tech text-[10px] tracking-[0.32em] uppercase text-[#1A5D3A] block mb-2.5">
            Order Confirmed // #{orderDetails?.orderNumber}
          </span>
          <h1 className="font-display italic text-4xl sm:text-5xl font-semibold text-[#0D0D0D] mb-3 tracking-[-0.015em]">
            Thank You For Your Order
          </h1>
          <p className="font-body text-sm text-[#64625C] max-w-lg mx-auto leading-relaxed">
            Your Mystique pieces are being prepared and hand-inspected at our atelier. A confirmation receipt has been dispatched to your email.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={downloadInvoice}
              disabled={downloadingPDF}
              className="inline-flex items-center gap-2 bg-[#0D0D0D] text-[#F6F5F1] px-7 py-3.5 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.22em] uppercase hover:bg-[#262626] transition-colors disabled:opacity-50"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Invoice...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download Invoice PDF</span>
                </>
              )}
            </button>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[2px] border border-[#0D0D0D]/25 text-[#0D0D0D] hover:border-[#0D0D0D] font-body text-[11px] font-semibold tracking-[0.22em] uppercase transition-colors"
            >
              <span>Continue Exploring</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-6 sm:p-7 space-y-4">
            <h2 className="font-display italic text-2xl text-[#0D0D0D] flex items-center gap-2.5 pb-3.5 border-b border-[#0D0D0D]/10">
              <CreditCard className="h-4 w-4 text-[#0D0D0D]" />
              <span>Order Dossier</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-[#64625C]">Reference</span>
                <span className="font-mono-tech text-[#0D0D0D]">
                  #{orderDetails?.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64625C]">Placed</span>
                <span className="text-[#0D0D0D]">
                  {formatDate(orderDetails?.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64625C]">Status</span>
                <span className="capitalize text-[#1A5D3A] font-medium">
                  {orderDetails?.paymentStatus?.replace(/_/g, " ").toLowerCase() ||
                    "Confirmed"}
                </span>
              </div>

              <div className="pt-3 border-t border-[#0D0D0D]/10 space-y-2">
                <div className="flex justify-between text-[#64625C]">
                  <span>Subtotal</span>
                  <span className="text-[#0D0D0D]">
                    {formatCurrency(orderDetails?.subtotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-[#64625C]">
                  <span>Shipping</span>
                  <span className={!orderDetails?.shippingCost ? "text-[#1A5D3A] font-medium" : "text-[#0D0D0D]"}>
                    {orderDetails?.shippingCost > 0
                      ? formatCurrency(orderDetails.shippingCost)
                      : "FREE"}
                  </span>
                </div>
                {orderDetails?.discountAmount > 0 && (
                  <div className="flex justify-between text-[#1A5D3A]">
                    <span>
                      Discount
                      {orderDetails?.discountCode ? ` (${orderDetails.discountCode})` : ""}
                    </span>
                    <span>-{formatCurrency(orderDetails.discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline pt-3.5 border-t border-[#0D0D0D]/12">
                <span className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#64625C]">
                  Total Paid
                </span>
                <span className="font-display text-2xl font-semibold text-[#0D0D0D]">
                  {formatCurrency(orderDetails?.total || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-6 sm:p-7 space-y-4">
            <h2 className="font-display italic text-2xl text-[#0D0D0D] flex items-center gap-2.5 pb-3.5 border-b border-[#0D0D0D]/10">
              {requiresShipping ? (
                <Truck className="h-4 w-4 text-[#0D0D0D]" />
              ) : (
                <Package className="h-4 w-4 text-[#0D0D0D]" />
              )}
              <span>{requiresShipping ? "Dispatch & Delivery" : "Delivery Info"}</span>
            </h2>

            {requiresShipping ? (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64625C]">Method</span>
                  <span className="text-[#0D0D0D] font-medium">{orderDetails?.shippingMethod}</span>
                </div>
                {orderDetails?.trackingInfo ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#64625C]">Tracking</span>
                      <a
                        href={orderDetails.trackingInfo.trackingUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0D0D0D] underline underline-offset-4 font-mono-tech"
                      >
                        {orderDetails.trackingInfo.trackingId}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64625C]">Shipment Status</span>
                      <span className="capitalize text-[#0D0D0D] font-medium">
                        {orderDetails.trackingInfo.status}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-[#64625C] text-xs leading-relaxed pt-2">
                    Your tracking number will be emailed to you as soon as your parcel leaves our atelier (1–2 business days).
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[#64625C] text-xs leading-relaxed">
                Dispatch details will be sent directly to your registered email address.
              </p>
            )}
          </div>
        </div>

        {/* Items */}
        {orderDetails?.items?.length > 0 && (
          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-6 sm:p-7 mb-8">
            <h2 className="font-display italic text-2xl text-[#0D0D0D] pb-4 border-b border-[#0D0D0D]/10">
              Pieces In Your Order
            </h2>
            <div className="divide-y divide-[#0D0D0D]/10">
              {orderDetails.items.map((item, idx) => (
                <div key={item.id || idx} className="py-4 flex items-center gap-4">
                  <div className="bg-[#EAE8E2] border border-[#0D0D0D]/10 rounded-[2px] w-16 h-20 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-[#64625C]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-body text-sm font-medium text-[#0D0D0D] truncate">
                      {item.name}
                    </h3>
                    <p className="font-mono-tech text-[11px] text-[#64625C] mt-1">
                      {item.variant && `${item.variant} • `}Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="font-body text-sm font-semibold text-[#0D0D0D]">
                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concierge Support Strip */}
        <div className="bg-[#EAE8E2] border border-[#0D0D0D]/12 rounded-[2px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display italic text-xl text-[#0D0D0D]">
              Need Concierge Assistance?
            </p>
            <p className="font-body text-xs text-[#64625C] mt-0.5">
              Our atelier support team is ready to help with sizing, address updates, or tracking.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[2px] border border-[#0D0D0D]/25 text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] font-mono-tech text-[10px] tracking-[0.22em] uppercase transition-colors whitespace-nowrap"
          >
            <span>Contact Atelier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const OrderConfirmationContent = () => {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = async (orderId) => {
    const response = await fetch(`/api/orders/${orderId}`);
    if (!response.ok) throw new Error("Could not locate this order reference.");
    return response.json();
  };

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderId = searchParams.get("orderId");
        if (!orderId) throw new Error("Missing order reference.");
        const data = await fetchOrderDetails(orderId);
        setOrderDetails(data);
        clearCart();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [searchParams, clearCart]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const orderId = searchParams.get("orderId");
    if (orderId) {
      fetchOrderDetails(orderId)
        .then(setOrderDetails)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={handleRetry} />;
  if (!orderDetails)
    return <ErrorDisplay error="No order details found." onRetry={handleRetry} />;

  return <OrderContent orderDetails={orderDetails} />;
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
