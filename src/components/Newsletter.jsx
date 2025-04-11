"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Subscribed successfully with: ${email}`);
    setEmail("");
  };

  return (
    <div className="relative bg-black py-20 px-6 md:px-12 lg:px-16 border-t border-white/10">
      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-black to-black opacity-100"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        {/* Premium Heading */}
        <h2 className="text-5xl font-extrabold uppercase tracking-[0.15em] text-white mb-6 leading-[1.2]">
          Stay Ahead of <br />
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Fashion & Luxury
          </span>
        </h2>
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          Get VIP access to exclusive drops, limited editions, and members-only offers.
        </p>

        {/* Subscription Form */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center w-full max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-6 py-4 bg-gray-900 text-white border border-white/30 rounded-full outline-none focus:ring-2 focus:ring-white/60 transition-all duration-300 placeholder-gray-400 text-left tracking-wide"
            required
          />
          <button
            type="submit"
            className="absolute right-2 bg-gradient-to-r from-white to-gray-500 text-black px-5 py-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-bold uppercase tracking-wide"
          >
            <Send className="w-5 h-5" />
            <span className="hidden md:inline">Subscribe</span>
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4 tracking-wide">
          No spam, only premium updates. Unsubscribe anytime.
        </p>
      </motion.div>
    </div>
  );
}
