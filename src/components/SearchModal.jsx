"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ArrowUpRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { fetchProducts } from "@/lib/fetchProducts";
import formatCurrency from "@/lib/formatCurrency";

const TRENDING_TAGS = ["Oversized", "Hoodie", "Tee", "Black", "240 GSM", "Drop"];

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useCart();
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 60);

      if (!hasFetched.current) {
        hasFetched.current = true;
        setLoading(true);
        fetchProducts()
          .then((data) => setProducts(data || []))
          .catch((err) => console.error("[SEARCH] Fetch failed:", err))
          .finally(() => setLoading(false));
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return products.slice(0, 4);
    return products
      .filter((p) => {
        const haystack = [
          p.title,
          p.category,
          p.collection,
          p.material,
          ...(p.availableColors || []).map((c) => c.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmed);
      })
      .slice(0, 8);
  }, [products, query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    closeSearch();
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-[85] flex items-start justify-center pt-14 sm:pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-3xl bg-[#F6F5F1] text-[#0D0D0D] border border-[#0D0D0D]/15 shadow-[0_30px_90px_rgba(0,0,0,0.28)] overflow-hidden"
          >
            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3.5 px-6 py-5 border-b border-[#0D0D0D]/12 bg-white"
            >
              <Search className="w-4 h-4 text-[#0D0D0D] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search archive pieces, silhouettes, colors..."
                className="flex-1 bg-transparent text-[#0D0D0D] placeholder-[#64625C]/65 text-sm sm:text-base font-body outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#64625C] hover:text-[#0D0D0D]"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={closeSearch}
                className="w-8 h-8 border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] transition-colors"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              <div>
                <p className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#64625C] mb-3">
                  Popular Queries
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 bg-white border border-[#0D0D0D]/15 hover:border-[#0D0D0D] text-[#0D0D0D] font-mono-tech text-[10px] uppercase tracking-[0.16em] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#64625C]">
                    {query.trim()
                      ? `${results.length} Matching Pieces`
                      : "Featured In Archive"}
                  </p>
                  {query.trim() && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#0D0D0D] inline-flex items-center gap-1 hover:opacity-65"
                    >
                      <span>View All</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="aspect-[3/4] skeleton-shimmer" />
                        <div className="h-3 w-3/4 skeleton-shimmer" />
                      </div>
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-10 text-center border border-[#0D0D0D]/10 bg-white">
                    <p className="font-display italic text-xl text-[#0D0D0D] mb-1">
                      No Pieces Found
                    </p>
                    <p className="text-xs text-[#64625C]">
                      Try a broader term or explore the full catalog.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {results.map((product) => {
                      const slugValue =
                        typeof product.slug === "string"
                          ? product.slug
                          : product.slug?.current || product.id;
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${slugValue}`}
                          onClick={closeSearch}
                          className="group block"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#EAE8E2] border border-[#0D0D0D]/8">
                            <img
                              src={product.frontImage || "https://picsum.photos/400/520"}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <h4 className="mt-2.5 text-xs text-[#0D0D0D] line-clamp-1 font-medium">
                            {product.title}
                          </h4>
                          <p className="font-mono-tech text-[11px] text-[#64625C] mt-0.5">
                            {formatCurrency(product.price)}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-[#EAE8E2] border-t border-[#0D0D0D]/10 flex items-center justify-between text-[9px] text-[#64625C] font-mono-tech tracking-[0.2em]">
              <span>ESC TO CLOSE</span>
              <span>ENTER TO SEARCH ARCHIVE</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
