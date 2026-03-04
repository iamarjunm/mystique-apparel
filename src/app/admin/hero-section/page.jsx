"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { ImageIcon, Edit, RefreshCw } from "lucide-react";

export default function HeroSectionPage() {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "heroSection"][0] {
            _id,
            heading,
            subheading,
            backgroundImage,
            ctaText,
            ctaLink,
            createdAt
          }`
        );
        setHero(data);
      } catch (error) {
        console.error("Error fetching hero section:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
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
            <ImageIcon className="w-8 h-8 text-blue-400" />
            Hero Section
          </h1>
          <p className="text-gray-400">Manage your homepage hero banner</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Hero Preview */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-gray-400">
            Loading hero section...
          </div>
        ) : hero ? (
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Heading
              </label>
              <p className="text-2xl font-bold text-white">{hero.heading}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Subheading
              </label>
              <p className="text-gray-300">{hero.subheading}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                CTA Button
              </label>
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">{hero.ctaText}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-300">{hero.ctaLink}</span>
              </div>
            </div>

            {hero.backgroundImage && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Background Image
                </label>
                <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">✓ Image configured</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                <Edit className="w-4 h-4" />
                Edit Hero
              </button>
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-400">
            No hero section configured
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-300 mb-3">Hero Section Tips</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Use high-quality images (1920×1080px or larger)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Keep heading concise and impactful</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>CTA link should be a valid page path (e.g., /shop)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Optimize images for better page performance</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
