"use client";

import { motion } from "framer-motion";

export default function MarqueeBanner() {
  return (
    <div className="border-y border-white/10 bg-gradient-to-br from-gray-950/40 via-black to-gray-950/40 py-2 sm:py-3 overflow-hidden flex relative z-14">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 sm:space-x-6 px-4">
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white/40">
              Premium Heavyweight
            </span>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/20" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white/40">
              Oversized Fit
            </span>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/20" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white/40">
              Dark Aesthetics
            </span>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/20" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white/40">
              Limited Drops
            </span>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/20" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
