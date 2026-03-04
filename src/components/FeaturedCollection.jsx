"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

export default function FeaturedCollection({ products = [] }) {
  return (
    <section
      id="collection"
      className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-20 bg-black"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-6">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase mb-4 text-white"
          >
            Latest Drop
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-xs sm:text-sm tracking-widest uppercase"
          >
            Collection 001 // The Awakening
          </motion.p>
        </div>
        <Link
          href="/shop"
          className="group flex items-center text-xs font-bold tracking-[0.2em] uppercase text-white"
        >
          View All
          <span className="ml-2 w-0 h-[1px] bg-white group-hover:w-8 transition-all duration-300" />
        </Link>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/50 text-sm">Loading products...</p>
        </div>
      )}
    </section>
  );
}
