"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

const OrdersSection = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user?.email) {
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("[ORDERS] Error fetching orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.email]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
      case "paid":
        return "bg-[#1A5D3A]/10 text-[#1A5D3A] border-[#1A5D3A]/25";
      case "processing":
      case "pending":
        return "bg-[#7C4A15]/10 text-[#7C4A15] border-[#7C4A15]/25";
      case "shipped":
        return "bg-[#0D0D0D] text-[#F6F5F1] border-[#0D0D0D]";
      case "cancelled":
      case "refunded":
        return "bg-[#991B1B]/10 text-[#991B1B] border-[#991B1B]/25";
      default:
        return "bg-[#EAE8E2] text-[#0D0D0D] border-[#0D0D0D]/15";
    }
  };

  const SectionHeader = () => (
    <div className="border-b border-[#0D0D0D]/10 pb-5 mb-8">
      <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C] block mb-1">
        03 // Archive
      </span>
      <h2 className="font-display italic text-3xl text-[#0D0D0D]">
        Your Orders
      </h2>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10">
        <SectionHeader />
        <div className="flex justify-center py-14">
          <Loader2 className="h-8 w-8 animate-spin text-[#0D0D0D]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10">
        <SectionHeader />
        <div className="bg-[#991B1B]/6 border border-[#991B1B]/25 text-[#991B1B] p-5 rounded-[2px] text-sm">
          Error loading orders: {error}
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10">
        <SectionHeader />
        <div className="text-center py-14 bg-[#F6F5F1] border border-[#0D0D0D]/10 rounded-[2px]">
          <Package className="w-6 h-6 text-[#64625C] mx-auto mb-3" />
          <p className="font-display italic text-2xl text-[#0D0D0D] mb-2">
            No Orders Yet
          </p>
          <p className="font-body text-xs text-[#64625C] mb-6">
            Explore our heavyweight 240 GSM essentials to place your first order.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#0D0D0D] text-[#F6F5F1] font-body text-[11px] font-semibold rounded-[2px] hover:bg-[#262626] transition-colors uppercase tracking-[0.22em]"
          >
            <span>Browse Collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10">
      <SectionHeader />
      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-[#F6F5F1] border border-[#0D0D0D]/12 rounded-[2px] p-6 hover:border-[#0D0D0D]/30 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 pb-5 mb-5 border-b border-[#0D0D0D]/10">
              <div>
                <h3 className="font-mono-tech font-semibold text-base text-[#0D0D0D]">
                  #{order.orderNumber}
                </h3>
                <p className="font-body text-xs text-[#64625C] mt-1">
                  Placed {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`inline-block self-start px-3 py-1 rounded-[2px] border font-mono-tech text-[10px] font-semibold uppercase tracking-[0.18em] ${getStatusStyle(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="mb-5 space-y-3">
              {order.lineItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.image && (
                    <div className="w-14 h-16 bg-[#EAE8E2] rounded-[2px] overflow-hidden flex-shrink-0 border border-[#0D0D0D]/10">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-[#0D0D0D] truncate">
                      {item.name}
                    </p>
                    <p className="font-mono-tech text-xs text-[#64625C] mt-0.5">
                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {order.lineItems.length > 3 && (
                <p className="font-mono-tech text-[11px] text-[#64625C] pl-[72px]">
                  +{order.lineItems.length - 3} more items
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-5 border-t border-[#0D0D0D]/10">
              <div>
                <p className="font-mono-tech text-[10px] text-[#64625C] uppercase tracking-[0.2em]">
                  Total Amount
                </p>
                <p className="font-display text-2xl font-semibold text-[#0D0D0D]">
                  ₹{order.total.toFixed(2)}
                </p>
              </div>
              <Link
                href={`/account/orders/${order.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[#0D0D0D]/25 text-[#0D0D0D] font-mono-tech text-[10px] font-semibold rounded-[2px] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] transition-colors uppercase tracking-[0.2em]"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersSection;
