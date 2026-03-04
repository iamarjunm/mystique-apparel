"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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

        console.log('[ORDERS] Fetching orders for:', user.email);
        setLoading(true);
        const response = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        console.log('[ORDERS] Fetched orders:', data);
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
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Unknown date";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'bg-green-500';
      case 'processing':
      case 'pending':
        return 'bg-yellow-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-10 uppercase tracking-[0.15em]">
            Your Orders
          </h2>
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-zinc-400" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-10 uppercase tracking-[0.15em]">
            Your Orders
          </h2>
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-6 rounded-xl">
            Error loading orders: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="space-y-6">
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-10 uppercase tracking-[0.15em]">
            Your Orders
          </h2>
          <div className="text-center py-16">
            <p className="text-lg text-zinc-300 mb-6">You haven't placed any orders yet.</p>
            <Link href="/shop" className="inline-block px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-wider text-sm">
              Browse products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-8 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-10 uppercase tracking-[0.15em]">
          Your Orders
        </h2>
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 hover:border-white/20 transition-all">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-xl text-zinc-100">#{order.orderNumber}</h3>
                  <p className="text-sm text-zinc-400 mt-2">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg">
                  <span className={`h-3 w-3 rounded-full ${getStatusColor(order.status)}`}></span>
                  <span className="text-sm font-bold capitalize text-zinc-100 uppercase tracking-wider">{order.status}</span>
                </div>
              </div>

              <div className="mb-6 space-y-4">
                {order.lineItems.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-5 py-3">
                    {item.image && (
                      <div className="w-16 h-16 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-zinc-100 mb-1">{item.name}</p>
                      <p className="text-sm text-zinc-400">
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                {order.lineItems.length > 3 && (
                  <p className="text-sm text-zinc-400 pl-[84px] font-medium">
                    +{order.lineItems.length - 3} more items
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-xs text-zinc-400 mb-1 uppercase tracking-wider">Total Amount</p>
                  <p className="font-bold text-2xl text-zinc-100">₹{order.total.toFixed(2)}</p>
                </div>
                <Link 
                  href={`/account/orders/${order.id}`}
                  className="inline-block px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all text-center uppercase tracking-wider"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersSection;