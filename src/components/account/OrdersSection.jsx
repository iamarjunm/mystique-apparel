"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const OrdersSection = () => {
  const { user } = useUser();
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
        console.error("Error fetching orders:", err);
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
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
        <div className="bg-gray-900 p-6 rounded-lg flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
        <div className="bg-gray-900 p-6 rounded-lg text-red-400">
          Error loading orders: {error}
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
        <div className="bg-gray-900 p-6 rounded-lg">
          <p>You haven't placed any orders yet.</p>
          <Link href="/products" className="text-blue-400 hover:underline mt-2 inline-block">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">Order #{order.orderNumber}</h3>
                <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${getStatusColor(order.status)}`}></span>
                <span className="text-sm capitalize">{order.status}</span>
              </div>
            </div>

            <div className="mb-4">
              {order.lineItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center py-2">
                  {item.image && (
                    <div className="w-12 h-12 bg-gray-800 rounded-md mr-3 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {order.lineItems.length > 3 && (
                <p className="text-sm text-gray-400 mt-2">
                  +{order.lineItems.length - 3} more items
                </p>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <p className="font-medium">₹{order.total.toFixed(2)}</p>
              <Link 
                href={`/account/orders/${order.id}`}
                className="text-blue-400 hover:underline text-sm"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersSection;