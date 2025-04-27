"use client";

import Newsletter from "@/components/Newsletter";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AboutPage() {
  const [showTeam, setShowTeam] = useState(false);

  return (
    <div className="relative bg-black py-20 px-0 border-t border-white/10">
      {/* Subtle Dark Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black opacity-100"></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center text-white max-w-3xl mx-auto"
      >
        <h2 className="text-6xl font-extrabold uppercase tracking-[0.1em] mb-12">
          Discover the Essence of <br />
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Mystique Apparel
          </span>
        </h2>
        <p className="text-xl mb-12 leading-relaxed text-gray-300">
          We are a premium lifestyle brand, where luxury meets comfort. Our oversized clothing blends style, quality, and craftsmanship—created for those who demand more than just clothing but a statement. Mystique Apparel is for the confident, the bold, and those who embrace their uniqueness.
        </p>
      </motion.div>

      {/* Brand Story Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative max-w-4xl mx-auto bg-gradient-to-b from-black/80 via-black/60 to-black text-white p-12 rounded-3xl shadow-[0px_0px_50px_rgba(255,255,255,0.2)]"
      >
        <h3 className="text-4xl font-semibold uppercase text-center mb-8">Our Story</h3>
        <p className="text-lg leading-relaxed text-gray-300 mb-8">
          Mystique Apparel was born from the fusion of passion and vision. Founded by two teenage entrepreneurs, Krishna and Manan, still in school, the brand grew out of their desire to create clothing that was not only about fashion but also about the art of living well. Mystique Apparel represents a lifestyle of refined taste and individuality, offering oversized clothing that’s crafted to stand out while providing unrivaled comfort.
        </p>
        <p className="text-lg leading-relaxed text-gray-300 mb-8">
          Every piece in our collection is designed with intricate details, from the highest quality fabrics to the stitching that ensures durability. We don’t just make clothing—we curate experiences that help you express your best self. Our mission is clear: to provide a premium clothing experience that transcends trends, offering timeless pieces that speak volumes.
        </p>
        <p className="text-lg leading-relaxed text-gray-300 mb-8">
          We are not just creating garments; we’re cultivating a community of those who believe in luxury without compromise. When you wear Mystique Apparel, you are embracing a philosophy of sophistication, elegance, and, most importantly, authenticity.
        </p>
      </motion.div>

      {/* Luxurious Quote Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative bg-gradient-to-t from-black/90 via-black/60 to-black text-white py-24 px-6 md:px-12 lg:px-16 mt-16"
      >
        <blockquote className="text-4xl italic text-center mb-8">
          “Luxury is in each detail. We redefine it every day.”
        </blockquote>
        <p className="text-lg text-center text-gray-300">
          At Mystique Apparel, we believe that luxury lies not just in what you wear, but in how you feel when you wear it. Every stitch, every cut, every design is meticulously crafted to provide not only an aesthetic experience but an emotional one, elevating your sense of self and confidence.
        </p>
      </motion.div>

      <Newsletter />
    </div>
  );
}
