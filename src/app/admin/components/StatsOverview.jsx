"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import {
  Users,
  ShoppingCart,
  Package,
  Mail,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function StatsOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    contactForms: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    outOfStockProducts: 0,
    newContactForms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts
        const [users, totalOrders, products, forms] = await Promise.all([
          client.fetch('count(*[_type == "userProfile"])'),
          client.fetch('count(*[_type == "order"])'),
          client.fetch('count(*[_type == "product"])'),
          client.fetch('count(*[_type == "contactForm"])'),
        ]);

        // Fetch order details for revenue and status breakdown
        const orderData = await client.fetch(
          `*[_type == "order"] {
            totalPrice,
            status,
            createdAt
          }`
        );

        // Fetch product stock info
        const productData = await client.fetch(
          `*[_type == "product"] {
            variants[]{
              sizeStock{
                xxs, xs, s, m, l, xl, xxl
              }
            }
          }`
        );

        // Fetch new contact forms
        const newForms = await client.fetch(
          `count(*[_type == "contactForm" && status == "new"])`
        );

        // Calculate stats
        const totalRevenue = orderData.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        );
        const completedOrders = orderData.filter(
          (o) => o.status === "completed"
        ).length;
        const pendingOrders = orderData.filter(
          (o) => o.status === "pending"
        ).length;
        const avgOrderValue =
          orderData.length > 0 ? totalRevenue / orderData.length : 0;

        const outOfStockProducts = productData.filter((p) => {
          // Product is out of stock only if ALL variants are out of stock
          if (!p.variants || p.variants.length === 0) return true;
          
          return p.variants.every((variant) => {
            if (!variant.sizeStock) return true;
            const totalForVariant =
              (variant.sizeStock.xxs || 0) +
              (variant.sizeStock.xs || 0) +
              (variant.sizeStock.s || 0) +
              (variant.sizeStock.m || 0) +
              (variant.sizeStock.l || 0) +
              (variant.sizeStock.xl || 0) +
              (variant.sizeStock.xxl || 0);
            return totalForVariant <= 0;
          });
        }).length;

        setStats({
          totalUsers: users,
          totalOrders,
          totalProducts: products,
          contactForms: forms,
          totalRevenue,
          avgOrderValue,
          completedOrders,
          pendingOrders,
          outOfStockProducts,
          newContactForms: newForms,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const mainStats = [
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      subtext: `${stats.totalOrders} orders`,
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      subtext: `${stats.completedOrders} completed`,
      icon: ShoppingCart,
      color: "blue",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      subtext: "registered users",
      icon: Users,
      color: "purple",
    },
    {
      label: "Avg Order Value",
      value: `₹${stats.avgOrderValue.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      subtext: "per order",
      icon: ShoppingCart,
      color: "cyan",
    },
  ];

  const secondaryStats = [
    {
      label: "Completed Orders",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Products",
      value: stats.totalProducts,
      icon: Package,
      color: "blue",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStockProducts,
      icon: AlertCircle,
      color: "red",
    },
    {
      label: "Contact Forms",
      value: stats.contactForms,
      icon: Mail,
      color: "amber",
    },
    {
      label: "New Messages",
      value: stats.newContactForms,
      icon: AlertCircle,
      color: "orange",
    },
  ];

  const colorMap = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300",
    green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-300",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-300",
    red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-300",
    yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-300",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-300",
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${colorMap[stat.color]} border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-7 h-7" />
                {loading && (
                  <div className="w-8 h-8 bg-white/10 rounded animate-pulse"></div>
                )}
              </div>
              <h3 className="text-sm text-gray-300 mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-white mb-1">
                {loading ? "..." : stat.value}
              </p>
              <p className="text-xs text-gray-400">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${colorMap[stat.color]} border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all duration-300`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-300 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">
                {loading ? "..." : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          💡 <span className="font-semibold">Real-time Updates:</span> Statistics refresh every 30 seconds to show the latest data
        </p>
      </div>
    </div>
  );
}
