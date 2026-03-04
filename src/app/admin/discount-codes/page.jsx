"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Percent, Plus, Edit, Trash2 } from "lucide-react";

export default function DiscountCodesPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "discountCode"] | order(createdAt desc) {
            _id,
            code,
            discountPercentage,
            discountAmount,
            minPurchase,
            usageLimit,
            usedCount,
            isActive,
            expiryDate,
            createdAt
          }`
        );
        setDiscounts(data);
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Percent className="w-8 h-8 text-blue-400" />
            Discount Codes
          </h1>
          <p className="text-gray-400">Create and manage promotional discount codes</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          New Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Codes</p>
          <p className="text-3xl font-bold text-blue-400">{discounts.length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-400">
            {discounts.filter((d) => d.isActive).length}
          </p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Used</p>
          <p className="text-3xl font-bold text-purple-400">
            {discounts.reduce((sum, d) => sum + (d.usedCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Discount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Min Purchase
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Usage
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Expires
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    Loading discounts...
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No discount codes yet
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr
                    key={discount._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-mono font-bold">
                      {discount.code}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {discount.discountPercentage
                        ? `${discount.discountPercentage}%`
                        : `₹${(discount.discountAmount || 0).toLocaleString("en-IN")}`}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      ₹{(discount.minPurchase || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {discount.usedCount || 0} / {discount.usageLimit || "∞"}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {discount.expiryDate
                        ? new Date(discount.expiryDate).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          discount.isActive
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {discount.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button className="p-2 hover:bg-white/10 rounded transition-colors text-blue-400">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded transition-colors text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
