"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { fetchProducts } from "@/lib/fetchProducts";
import ProductCard from "@/components/ProductCard";

const FILTER_TABS = [
  { id: "all", label: "All Drops" },
  { id: "newArrival", label: "New In" },
  { id: "bestseller", label: "Bestsellers" },
  { id: "featured", label: "Atelier Picks" },
];

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("[TRENDING] Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products.slice(0, 10);
    const matched = products.filter((p) => Boolean(p[activeTab]));
    return (matched.length > 0 ? matched : products).slice(0, 10);
  }, [products, activeTab]);

  // Gentle auto-scroll that pauses on hover
  useEffect(() => {
    if (loading || filteredProducts.length <= 4 || isPaused) return;
    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 20) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const cardWidth = container.children[0]?.clientWidth || 300;
        container.scrollBy({ left: cardWidth + 20, behavior: "smooth" });
      }
    }, 4800);
    return () => clearInterval(interval);
  }, [loading, filteredProducts.length, isPaused]);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = container.children[0]?.clientWidth || 300;
    container.scrollBy({
      left: direction === "left" ? -(cardWidth + 20) : cardWidth + 20,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative bg-[#F6F5F1] text-[#0D0D0D]">
      <div className="max-w-[1380px] mx-auto">
        {/* Header + Stark Underline Filter Tabs Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12 pb-6 border-b border-[#0D0D0D]/[0.12]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono-tech text-[10px] tracking-[0.32em] uppercase text-[#64625C] block mb-2.5">
              01 // Curated Release
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-[#0D0D0D]">
              Trending <span className="italic font-normal">Now</span>
            </h2>
          </motion.div>

          {/* Filter Tabs + Square Arrows */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5 sm:gap-6">
            <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto hide-scrollbar">
              {FILTER_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                    }}
                    className={`relative pb-2 font-mono-tech text-[10px] sm:text-[11px] tracking-[0.18em] uppercase whitespace-nowrap transition-colors ${
                      isActive
                        ? "text-[#0D0D0D] font-semibold"
                        : "text-[#64625C] hover:text-[#0D0D0D]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="trendingTabUnderline"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-[#0D0D0D]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {!loading && filteredProducts.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  aria-label="Scroll left"
                  className="w-10 h-10 rounded-none border border-[#0D0D0D]/20 bg-transparent flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F4F2ED] hover:border-[#0D0D0D] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  aria-label="Scroll right"
                  className="w-10 h-10 rounded-none border border-[#0D0D0D]/20 bg-transparent flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F4F2ED] hover:border-[#0D0D0D] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Runway */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="space-y-3">
                  <div className="aspect-[3/4] rounded-none skeleton-shimmer border border-[#0D0D0D]/[0.06]" />
                  <div className="h-3.5 w-3/4 rounded-none skeleton-shimmer" />
                  <div className="h-3 w-1/3 rounded-none skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-white border border-[#0D0D0D]/[0.1] rounded-none">
              <p className="font-display italic text-2xl text-[#0D0D0D] mb-2">
                New drops arriving shortly
              </p>
              <p className="font-body text-xs text-[#64625C]">
                Explore the full archive to discover available silhouettes.
              </p>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar"
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[70%] xs:w-[56%] sm:w-[39%] md:w-[31%] lg:w-[23.8%] shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Solid Ink CTA */}
        <div className="mt-10 sm:mt-12 flex justify-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 px-9 py-4 rounded-none text-[11px] font-mono-tech font-semibold uppercase tracking-[0.24em] bg-[#0D0D0D] text-[#F4F2ED] border border-[#0D0D0D] hover:bg-transparent hover:text-[#0D0D0D] transition-colors duration-300"
          >
            <span>Explore Full Archive</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
