"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  Truck,
  CreditCard,
  Package,
  ArrowLeft,
  Download,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import formatCurrency from "@/lib/formatCurrency";
import { toast } from "react-toastify";

const OrderDetailsPage = ({ params }) => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

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

  const downloadInvoice = async () => {
    if (!orderDetails?.orderNumber) return;
    try {
      setDownloadingPDF(true);
      const response = await fetch(
        `/api/generate-invoice?orderId=${encodeURIComponent(orderDetails.orderNumber)}`
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
      toast.success("Invoice PDF downloaded");
    } catch (err) {
      console.error("Invoice download failed:", err);
      toast.error("Could not generate invoice right now.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date unavailable";
    }
  };

  const getStatusBadge = (status = "") => {
    const normalized = String(status).toLowerCase();
    if (normalized.includes("paid") || normalized.includes("delivered")) {
      return "bg-[#1A5D3A]/10 text-[#1A5D3A] border-[#1A5D3A]/25";
    }
    if (normalized.includes("cancel") || normalized.includes("refund")) {
      return "bg-[#991B1B]/10 text-[#991B1B] border-[#991B1B]/25";
    }
    if (normalized.includes("ship")) {
      return "bg-[#0D0D0D] text-[#F6F5F1] border-[#0D0D0D]";
    }
    return "bg-[#7C4A15]/10 text-[#7C4A15] border-[#7C4A15]/25";
  };

  const requiresShipping =
    orderDetails?.shippingMethod &&
    orderDetails.shippingMethod.toLowerCase() !== "no shipping";

  if (loading) {
    return (
      <div className="min-h-[78vh] bg-[#F6F5F1] text-[#0D0D0D] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-9 w-9 animate-spin mx-auto text-[#0D0D0D]" />
          <h1 className="font-display italic text-2xl">Retrieving Order Dossier</h1>
          <p className="font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#64625C]">
            Fetching order details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[78vh] bg-[#F6F5F1] text-[#0D0D0D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#0D0D0D]/12 rounded-[2px] p-10 text-center space-y-6">
          <AlertCircle className="h-10 w-10 text-[#991B1B] mx-auto" />
          <div className="space-y-2">
            <h1 className="font-display italic text-3xl text-[#0D0D0D]">
              Order Not Found
            </h1>
            <p className="font-body text-sm text-[#64625C]">{error}</p>
            {orderId && (
              <p className="font-mono-tech text-[11px] text-[#64625C]">
                Reference: {orderId}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/account/orders")}
              className="bg-[#0D0D0D] text-[#F6F5F1] px-6 py-3 rounded-[2px] font-mono-tech text-[10px] tracking-[0.22em] uppercase hover:bg-[#262626] transition-colors"
            >
              Back To Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const computedSubtotal =
    typeof orderDetails?.subtotal === "number"
      ? orderDetails.subtotal
      : orderDetails?.total || 0;

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back & Title Header */}
        <div className="pb-6 border-b border-[#0D0D0D]/12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#64625C] hover:text-[#0D0D0D] transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back To Orders</span>
            </Link>
            <h1 className="font-display italic text-3xl sm:text-4xl font-bold text-[#0D0D0D]">
              Order #{orderDetails?.orderNumber}
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#64625C] mt-1.5">
              Placed on {formatDate(orderDetails?.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3.5 py-1.5 border rounded-[2px] font-mono-tech text-[10px] font-semibold uppercase tracking-[0.2em] ${getStatusBadge(
                orderDetails?.status || orderDetails?.paymentStatus
              )}`}
            >
              {(orderDetails?.status || orderDetails?.paymentStatus || "Confirmed")
                .replace(/_/g, " ")}
            </span>

            <button
              type="button"
              onClick={downloadInvoice}
              disabled={downloadingPDF}
              className="inline-flex items-center gap-2 bg-[#0D0D0D] text-[#F6F5F1] px-5 py-2.5 rounded-[2px] font-mono-tech text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-[#262626] transition-colors disabled:opacity-50"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Invoice PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Details */}
          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-6 sm:p-7 space-y-4">
            <h2 className="font-display italic text-2xl text-[#0D0D0D] flex items-center gap-2.5 pb-3 border-b border-[#0D0D0D]/10">
              <CreditCard className="h-4 w-4 text-[#0D0D0D]" />
              <span>Payment Details</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-[#64625C]">Method</span>
                <span className="font-mono-tech uppercase text-[#0D0D0D]">
                  {orderDetails?.paymentMethod || "Online"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64625C]">Payment Status</span>
                <span className="capitalize text-[#0D0D0D] font-medium">
                  {orderDetails?.paymentStatus?.replace(/_/g, " ").toLowerCase() ||
                    "Confirmed"}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#0D0D0D]/10">
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#64625C]">
                  Total Amount
                </span>
                <span className="font-display text-2xl font-bold text-[#0D0D0D]">
                  {formatCurrency(orderDetails?.total || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping / Delivery Details */}
          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-6 sm:p-7 space-y-4">
            <h2 className="font-display italic text-2xl text-[#0D0D0D] flex items-center gap-2.5 pb-3 border-b border-[#0D0D0D]/10">
              {requiresShipping ? (
                <Truck className="h-4 w-4 text-[#0D0D0D]" />
              ) : (
                <Package className="h-4 w-4 text-[#0D0D0D]" />
              )}
              <span>{requiresShipping ? "Shipping Info" : "Delivery Info"}</span>
            </h2>

            {requiresShipping ? (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#64625C]">Method</span>
                  <span className="text-[#0D0D0D] text-right">
                    {orderDetails?.shippingMethod}
                  </span>
                </div>

                {orderDetails?.shippingAddress && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64625C]">Address</span>
                    <div className="text-right text-[#0D0D0D]">
                      {(orderDetails.shippingAddress.firstName ||
                        orderDetails.shippingAddress.lastName) && (
                        <div className="font-medium">
                          {orderDetails.shippingAddress.firstName}{" "}
                          {orderDetails.shippingAddress.lastName}
                        </div>
                      )}
                      <div className="text-[#64625C] text-xs mt-0.5">
                        {orderDetails.shippingAddress.address1 ||
                          orderDetails.shippingAddress.street}
                      </div>
                      {(orderDetails.shippingAddress.city ||
                        orderDetails.shippingAddress.state) && (
                        <div className="text-[#64625C] text-xs">
                          {[
                            orderDetails.shippingAddress.city,
                            orderDetails.shippingAddress.state,
                            orderDetails.shippingAddress.postalCode ||
                              orderDetails.shippingAddress.zip,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {orderDetails?.trackingInfo ? (
                  <>
                    <div className="flex justify-between gap-4 pt-2 border-t border-[#0D0D0D]/10">
                      <span className="text-[#64625C]">Tracking ID</span>
                      <a
                        href={orderDetails.trackingInfo.trackingUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono-tech text-[#0D0D0D] underline underline-offset-4 hover:opacity-65"
                      >
                        <span>{orderDetails.trackingInfo.trackingId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[#64625C]">Shipment Status</span>
                      <span className="capitalize text-[#0D0D0D] font-medium">
                        {orderDetails.trackingInfo.status || "Processing"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-[#64625C] pt-2 border-t border-[#0D0D0D]/10">
                    Tracking details will appear here and via email once dispatched.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#64625C] leading-relaxed">
                Dispatch details will be sent directly to your registered email.
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-6 sm:p-7">
          <h2 className="font-display italic text-2xl text-[#0D0D0D] pb-4 border-b border-[#0D0D0D]/10">
            Pieces In This Order
          </h2>

          <div className="divide-y divide-[#0D0D0D]/10">
            {orderDetails?.items?.map((item, idx) => (
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
                  <p className="font-mono-tech text-[11px] text-[#64625C] mt-0.5">
                    {formatCurrency(item.price || 0)} each
                  </p>
                </div>
                <div className="font-mono-tech text-sm font-semibold text-[#0D0D0D] flex-shrink-0">
                  {formatCurrency((item.price || 0) * (item.quantity || 1))}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#0D0D0D]/12 pt-5 mt-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-[#64625C]">
              <span>Subtotal</span>
              <span className="text-[#0D0D0D]">{formatCurrency(computedSubtotal)}</span>
            </div>
            <div className="flex justify-between text-[#64625C]">
              <span>Shipping</span>
              <span className="text-[#0D0D0D]">
                {orderDetails?.shippingCost > 0
                  ? formatCurrency(orderDetails.shippingCost)
                  : "Complimentary"}
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
            <div className="flex justify-between text-[#64625C]">
              <span>Taxes</span>
              <span className="text-[#0D0D0D]">Included</span>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-[#0D0D0D]/15">
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.22em] text-[#64625C]">
                Total
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
                {formatCurrency(orderDetails?.total || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* External Invoice Iframe (only if legacy invoiceUrl exists) */}
        {orderDetails?.invoiceUrl && (
          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-6 sm:p-7 space-y-4">
            <h2 className="font-display italic text-2xl text-[#0D0D0D]">
              Attached Invoice
            </h2>
            <iframe
              src={orderDetails.invoiceUrl}
              className="w-full h-[540px] border border-[#0D0D0D]/12"
              title="Order Invoice"
              loading="lazy"
            />
            <div className="flex flex-wrap gap-3">
              <a
                href={orderDetails.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0D0D0D] text-[#F6F5F1] px-5 py-2.5 rounded-[2px] font-mono-tech text-[10px] tracking-[0.2em] uppercase hover:bg-[#262626] transition-colors"
              >
                Open Full Invoice
              </a>
              <button
                type="button"
                onClick={() => window.open(orderDetails.invoiceUrl, "_blank")?.print()}
                className="border border-[#0D0D0D]/25 text-[#0D0D0D] px-5 py-2.5 rounded-[2px] font-mono-tech text-[10px] tracking-[0.2em] uppercase hover:border-[#0D0D0D] transition-colors"
              >
                Print Invoice
              </button>
            </div>
          </div>
        )}

        {/* Concierge & Continue Shopping */}
        <div className="bg-[#EAE8E2] border border-[#0D0D0D]/10 rounded-[2px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display italic text-xl text-[#0D0D0D]">
              Need Concierge Assistance?
            </h3>
            <p className="font-body text-xs text-[#64625C] mt-1">
              Questions regarding sizing, delivery, or this order? Our atelier team is here to help.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="px-5 py-2.5 border border-[#0D0D0D]/25 text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] font-mono-tech text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D0D0D] text-[#F6F5F1] hover:bg-[#262626] font-mono-tech text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              <span>Explore Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
