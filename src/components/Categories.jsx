"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { client, urlFor } from "../../sanity";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const query = `*[_type == "category"]|order(title asc){
          _id,
          title,
          slug,
          image,
          description
        }`;
        const data = await client.fetch(query);
        const mapped = (data || []).map((cat) => ({
          id: cat._id,
          name: cat.title,
          slug: cat.slug?.current || cat.slug,
          image: cat.image?.asset?._ref
            ? urlFor(cat.image).width(800).height(1060).url()
            : "/images/editorial-atelier.jpg",
          description: cat.description || "Heavyweight architectural silhouettes.",
        }));
        setCategories(mapped);
      } catch (error) {
        console.error("[CATEGORIES] Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="relative bg-[#F6F5F1] text-[#0D0D0D]">
      <div className="max-w-[1380px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12 pb-6 border-b border-[#0D0D0D]/[0.12]"
        >
          <div>
            <span className="font-mono-tech text-[10px] tracking-[0.32em] uppercase text-[#64625C] block mb-2.5">
              02 // Silhouette Directory
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-[#0D0D0D]">
              Shop by <span className="italic font-normal">Category</span>
            </h2>
          </div>

          <Link
            href="/shop"
            className="font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#64625C] hover:text-[#0D0D0D] inline-flex items-center gap-1.5 transition-colors"
          >
            View All Silhouettes
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-none skeleton-shimmer border border-[#0D0D0D]/[0.08]"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-14 text-center bg-white border border-[#0D0D0D]/[0.1] rounded-none">
            <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-[#64625C]">
              Categories coming soon
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((category, index) => (
              <motion.div
                key={category.slug || category.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                  delay: index * 0.06,
                }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={`/shop?category=${category.slug}`} className="block">
                  <div className="relative w-full overflow-hidden bg-[#EAE8E2] border border-[#0D0D0D]/[0.1] rounded-none aspect-[3/4] transition-colors duration-300 group-hover:border-[#0D0D0D]/40">
                    {/* Crisp Unmuted Photography */}
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Subtle Bottom Scrim ONLY Behind White Serif Title */}
                    <div className="absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/35 to-transparent pointer-events-none" />

                    {/* Top Index & Square Arrow */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-10">
                      <span className="font-mono-tech text-[10px] tracking-[0.22em] text-[#0D0D0D] bg-[#F6F5F1] px-2.5 py-1 rounded-none border border-[#0D0D0D]/15">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="w-8 h-8 rounded-none bg-[#F6F5F1] border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] group-hover:bg-[#0D0D0D] group-hover:text-[#F4F2ED] group-hover:border-[#0D0D0D] transition-colors duration-300">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Bottom Editorial Title */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10">
                      <h3 className="font-display italic text-xl sm:text-2xl font-normal text-[#F4F2ED] tracking-wide transition-transform duration-300 group-hover:-translate-y-0.5">
                        {category.name}
                      </h3>
                      <p className="font-body text-[11px] text-[#F4F2ED]/75 line-clamp-1 mt-1">
                        {category.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="h-px w-5 bg-[#F4F2ED]/70 transition-all duration-300 group-hover:w-9" />
                        <span className="font-mono-tech text-[9px] tracking-[0.26em] uppercase text-[#F4F2ED]">
                          Explore
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
