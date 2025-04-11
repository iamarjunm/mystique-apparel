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
    <section className="relative bg-black text-white">
      {/* Ethereal Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
      <div className="absolute top-[-30%] left-1/2 transform -translate-x-1/2 w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] bg-white/10 blur-[120px] opacity-20"></div>

      <div className="relative z-10 px-6 md:px-12 xl:px-24">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-[0.12em] leading-[1.1]">
            Trending <span className="bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent font-extrabold">Products</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mt-4 leading-relaxed">
            Must-have pieces defining oversized luxury. Limited drops, endless statement.
          </p>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12"
        >
          {products.length === 0 ? (
            <p className="text-center text-white">Loading products...</p>
          ) : (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </motion.div>

        {/* Load More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Link
            href="/shop"
            className="inline-block px-10 py-4 text-lg font-semibold uppercase tracking-wide border border-white text-white rounded-full transition-all duration-500 hover:bg-white hover:text-black shadow-[0px_0px_20px_rgba(255,255,255,0.3)] hover:shadow-[0px_0px_40px_rgba(255,255,255,0.6)]"
          >
            Load More
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
