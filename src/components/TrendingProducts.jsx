"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchProducts } from "@/lib/fetchProducts";
import ProductCard from "@/components/ProductCard"; 
import Link from "next/link"; 

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      const data = await fetchProducts();
      console.log("Fetched products:", data);
      setProducts(data.slice(0, 4));
    };
    getProducts();
  }, []);

  return (
    <section className="relative">
      <div className="container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.2em] mb-2">
            Trending{" "}
            <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-200 bg-clip-text text-transparent">
              Now
            </span>
          </h2>
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-zinc-400 animate-pulse">Loading products...</p>
            </div>
          ) : (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white transition-all duration-300 hover:bg-white hover:text-black hover:border-white group"
          >
            <span>Explore All</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
