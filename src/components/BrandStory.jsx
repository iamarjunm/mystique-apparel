"use client";

import React from "react";
import { motion } from "framer-motion";

const BrandStory = () => {
  return (
    <section className="relative bg-black text-white text-center px-6 md:px-12 xl:px-24 overflow-hidden">
      {/* Ethereal Glow & Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"></div>
      <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-white/10 blur-[120px] opacity-25"></div>

      {/* Title with High-End Typography */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-5xl sm:text-6xl font-black uppercase tracking-[0.12em] relative z-10 leading-[1.1]"
      >
        Born From <span className="bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent font-extrabold">Passion</span>
      </motion.h2>

      {/* Ultra-Luxury Story Text */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
        className="max-w-3xl mx-auto relative z-10 mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed tracking-wide"
      >
        <p className="mb-6">
          <span className="text-white font-bold">Two teenagers.</span> One vision. No investors.  
          Just <span className="text-white font-bold">raw ambition</span> and the little money they could manage.  
          From nothing to a statement—this is <span className="text-white font-extrabold">Mystique Apparel.</span>
        </p>

        <p>
          Not just a brand. A <span className="text-white font-bold">symbol of defiance. </span>  
          Designed for those who stand apart.
          Welcome to the new era of oversized luxury.
        </p>
      </motion.div>

      {/* Elegant Thin White Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        className="w-24 h-[2px] bg-white/50 mx-auto mt-8 origin-left"
      ></motion.div>
    </section>
  );
};

export default BrandStory;
