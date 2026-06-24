"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { fetchProducts } from "@/lib/fetchProducts";
import ProductCard from "@/components/ProductCard"; 
import Link from "next/link"; 
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const getProducts = async () => {
      const data = await fetchProducts();
      setProducts(data.slice(0, 8));
    };
    getProducts();
  }, []);

  const displayProducts = [...products, ...products, ...products, ...products, ...products, ...products];

  // Auto-scroll logic
  useEffect(() => {
    if (products.length === 0) return;
    
    if (scrollRef.current) {
      const singleBlockWidth = scrollRef.current.scrollWidth / 6;
      scrollRef.current.scrollTo({ left: singleBlockWidth * 2, behavior: 'instant' });
    }

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const firstChild = scrollRef.current.children[0];
        const scrollAmount = firstChild ? firstChild.clientWidth : 300;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [products]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth } = scrollRef.current;
    const singleBlockWidth = scrollWidth / 6;

    if (scrollLeft >= singleBlockWidth * 4) {
      scrollRef.current.scrollTo({ left: scrollLeft - singleBlockWidth * 2, behavior: 'instant' });
    }
    if (scrollLeft <= singleBlockWidth) {
      scrollRef.current.scrollTo({ left: scrollLeft + singleBlockWidth * 2, behavior: 'instant' });
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const firstChild = scrollRef.current.children[0];
      const scrollAmount = firstChild ? firstChild.clientWidth : 300;
      scrollRef.current.scrollBy({ 
        left: direction === "left" ? -scrollAmount : scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

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

        {/* Carousel Area */}
        <div className="relative group">
          {products.length > 0 && (
            <>
              <button 
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 z-10 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 z-10 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex -mx-2 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {displayProducts.length === 0 ? (
              <div className="w-full text-center py-12">
                <p className="text-zinc-400 animate-pulse">Loading products...</p>
              </div>
            ) : (
              displayProducts.map((product, idx) => (
                <div key={`${product.id}-${idx}`} className="w-full sm:w-1/2 lg:w-1/4 shrink-0 px-2 snap-start">
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </motion.div>
        </div>

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
