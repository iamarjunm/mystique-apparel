"use client";

import React from "react";
import { motion } from "framer-motion";

const BrandStory = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-5 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          {/* Title */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-[0.15em] leading-tight">
            Born From{" "}
            <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-200 bg-clip-text text-transparent">
              Passion
            </span>
          </h2>

          {/* Story Content */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 leading-relaxed font-light">
              Two teenagers. One vision. No investors. Just raw ambition and the little money they could manage.
            </p>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              From nothing to a statement—this is <span className="text-white font-bold">Mystique Apparel</span>. Not just a brand. A symbol of defiance. Designed for those who stand apart. Welcome to the new era of oversized luxury.
            </p>
          </div>

          {/* Elegant Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            viewport={{ once: true }}
            className="w-24 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default BrandStory;
