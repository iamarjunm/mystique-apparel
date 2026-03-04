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
    <section className="relative bg-gradient-to-br from-black via-gray-950 to-black border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-5 md:px-6 max-w-3xl py-8 sm:py-10 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center space-y-3 sm:space-y-4"
        >
          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.15em] leading-tight">
            Stay Ahead of{" "}
            <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-200 bg-clip-text text-transparent">
              Luxury
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Get VIP access to exclusive drops, limited editions, and members-only offers.
          </p>

          {/* Subscription Form */}
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center w-full max-w-md mx-auto mt-4 sm:mt-5"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white/5 text-white border border-white/10 rounded-lg outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 placeholder-zinc-500 text-left tracking-wide text-xs sm:text-sm"
              required
            />
            <button
              type="submit"
              className="absolute right-1.5 sm:right-2 bg-white text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-1.5 sm:gap-2 font-bold uppercase tracking-wider text-xs"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Subscribe</span>
            </button>
          </form>

          <p className="text-xs text-zinc-500 tracking-wide mt-2 sm:mt-3">
            No spam, only premium updates. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
