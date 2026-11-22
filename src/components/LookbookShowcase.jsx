"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fetchProducts } from "@/lib/fetchProducts";
import formatCurrency from "@/lib/formatCurrency";

export default function LookbookShowcase() {
  const [looks, setLooks] = useState([]);

  useEffect(() => {
    const loadLooks = async () => {
      try {
        const products = await fetchProducts();
        if (!Array.isArray(products) || products.length === 0) return;
        const prioritized = [
          ...products.filter((p) => p.featured || p.bestseller),
          ...products,
        ];
        const unique = Array.from(
          new Map(prioritized.map((p) => [p.id, p])).values()
        ).slice(0, 3);
        setLooks(unique);
      } catch (err) {
        console.error("[LOOKBOOK] Error loading looks:", err);
      }
    };
    loadLooks();
  }, []);

  if (looks.length === 0) return null;

  const primary = looks[0];
  const secondary = looks.slice(1, 3);

  const getSlug = (p) =>
    typeof p.slug === "string" ? p.slug : p.slug?.current || p.id;

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0A0A0A] text-[#F4F2ED] border-t border-white/[0.12]">
      <div className="max-w-[1380px] mx-auto">
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-10 sm:mb-12 border-b border-white/[0.12]"
        >
          <div>
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#8E8B84] block mb-2.5">
              04 // Visual Dossier
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-[#F4F2ED]">
              Shop The <span className="italic font-normal">Lookbook</span>
            </h2>
          </div>

          <Link
            href="/shop?featured=true"
            className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#8E8B84] hover:text-[#F4F2ED] inline-flex items-center gap-1.5 transition-colors"
          >
            Explore Campaign Archive
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Asymmetric 3-Look Magazine Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Primary Tall Feature Look */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <Link
              href={`/product/${getSlug(primary)}`}
              className="group relative block h-[460px] sm:h-[580px] lg:h-[660px] rounded-none overflow-hidden bg-[#141414] border border-white/[0.12] hover:border-[#F4F2ED]/45 transition-colors duration-300"
            >
              <img
                src={primary.frontImage || primary.backImage || "/images/hero-campaign.jpg"}
                alt={primary.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/45 to-transparent pointer-events-none" />

              {/* Top Stamps */}
              <div className="absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 flex items-center justify-between">
                <span className="font-mono-tech text-[10px] tracking-[0.28em] uppercase px-3 py-1.5 rounded-none bg-[#0A0A0A]/90 border border-white/[0.16] text-[#F4F2ED]">
                  LOOK 01 // FEATURED
                </span>
                <span className="w-9 h-9 rounded-none bg-[#0A0A0A]/90 border border-white/[0.18] flex items-center justify-center text-[#F4F2ED] group-hover:bg-[#F4F2ED] group-hover:text-[#0A0A0A] group-hover:border-[#F4F2ED] transition-colors duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>

              {/* Bottom Editorial Caption */}
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#8E8B84] mb-1.5">
                    Signature Heavyweight Silhouette
                  </p>
                  <h3 className="font-display italic text-2xl sm:text-3xl md:text-4xl text-[#F4F2ED] font-normal leading-tight">
                    {primary.title}
                  </h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono-tech text-sm text-[#F4F2ED] font-semibold block">
                    {formatCurrency(primary.price)}
                  </span>
                  <span className="font-mono-tech text-[9px] tracking-[0.22em] uppercase text-[#8E8B84] group-hover:text-[#F4F2ED] transition-colors">
                    Shop Piece →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Right Stacked Secondary Looks */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            {secondary.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 * (idx + 1),
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={`/product/${getSlug(item)}`}
                  className="group relative block h-[300px] sm:h-[320px] rounded-none overflow-hidden bg-[#141414] border border-white/[0.12] hover:border-[#F4F2ED]/45 transition-colors duration-300"
                >
                  <img
                    src={item.backImage || item.frontImage || "/images/editorial-atelier.jpg"}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/45 to-transparent pointer-events-none" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="font-mono-tech text-[9px] tracking-[0.28em] uppercase px-2.5 py-1 rounded-none bg-[#0A0A0A]/90 border border-white/[0.16] text-[#F4F2ED]">
                      LOOK 0{idx + 2}
                    </span>
                    <span className="w-8 h-8 rounded-none bg-[#0A0A0A]/90 border border-white/[0.18] flex items-center justify-center text-[#F4F2ED] group-hover:bg-[#F4F2ED] group-hover:text-[#0A0A0A] group-hover:border-[#F4F2ED] transition-colors duration-300">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display italic text-xl sm:text-2xl text-[#F4F2ED] font-normal line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="font-mono-tech text-[9px] tracking-[0.22em] uppercase text-[#8E8B84] group-hover:text-[#F4F2ED] mt-1 transition-colors">
                        Inspect Garment →
                      </p>
                    </div>
                    <span className="font-mono-tech text-xs font-semibold text-[#F4F2ED] flex-shrink-0">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
