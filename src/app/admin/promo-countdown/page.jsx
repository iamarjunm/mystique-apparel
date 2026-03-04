"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Clock, Edit, RefreshCw } from "lucide-react";

export default function PromoCountdownPage() {
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "promoCountdown"][0] {
            _id,
            title,
            description,
            promoCode,
            discountPercentage,
            endDate,
            isActive,
            buttonText,
            createdAt
          }`
        );
        setPromo(data);
      } catch (error) {
        console.error("Error fetching promo countdown:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromo();
  }, []);

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

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
            <Clock className="w-8 h-8 text-blue-400" />
            Promo Countdown
          </h1>
          <p className="text-gray-400">Manage limited-time promotional offers</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Promo Preview */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-gray-400">
            Loading promo countdown...
          </div>
        ) : promo ? (
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Title
              </label>
              <p className="text-2xl font-bold text-white">{promo.title}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description
              </label>
              <p className="text-gray-300">{promo.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Promo Code
                </label>
                <p className="text-xl font-mono font-bold text-yellow-400">
                  {promo.promoCode}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Discount
                </label>
                <p className="text-xl font-bold text-green-400">
                  {promo.discountPercentage}% OFF
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Ends On
                </label>
                <p className="text-white font-medium">
                  {promo.endDate
                    ? new Date(promo.endDate).toLocaleDateString()
                    : "Not set"}
                </p>
                {promo.endDate && (
                  <p className="text-gray-400 text-sm mt-1">
                    {getDaysRemaining(promo.endDate)} days remaining
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    promo.isActive
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}
                >
                  {promo.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Button Text
              </label>
              <p className="text-gray-300">{promo.buttonText}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                <Edit className="w-4 h-4" />
                Edit Promo
              </button>
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-400">
            No promo countdown configured
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-amber-300 mb-3">Promo Countdown Tips</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="text-amber-400">•</span>
            <span>Set clear expiration dates for promos</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400">•</span>
            <span>Use memorable promo codes that customers can easily remember</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400">•</span>
            <span>Activate/deactivate promos based on your marketing calendar</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400">•</span>
            <span>Only one promo countdown can be active at a time</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
