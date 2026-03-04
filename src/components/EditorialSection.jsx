"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { client } from "../../sanity";

export default function EditorialSection() {
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const query = `*[_type == "editorialSection"][0]{
          _id,
          title,
          description,
          cta,
          image
        }`;
        const data = await client.fetch(query);
        setSectionData(data || getDefaultData());
      } catch (error) {
        console.error("[EDITORIAL] Error fetching:", error);
        setSectionData(getDefaultData());
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, []);

  const getDefaultData = () => ({
    title: "Designed in The Shadows",
    description:
      "Mystique Apparel is not just clothing; it's a statement of presence. We craft oversized silhouettes that command attention while maintaining an aura of mystery. Every piece is engineered with premium heavyweight fabrics, distressed detailing, and custom hardware. We don't follow trends; we create garments for those who walk their own path in the dark.",
    cta: "Read Our Story",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&h=1000&fit=crop",
  });

  if (loading) return <div className="py-16 sm:py-20 md:py-24 bg-black" />;

  const data = sectionData || getDefaultData();

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-black relative z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl font-black tracking-[0.15em] uppercase text-white text-center"
          >
            {data.title}
          </motion.h2>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-12 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto"
          />

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/50 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-center space-y-2"
          >
            <p>{data.description}</p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center pt-2"
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[9px] sm:text-xs font-bold tracking-[0.25em] uppercase text-white/70 hover:text-white transition-colors duration-300 group"
            >
              <span className="w-0 h-px bg-white/40 group-hover:w-4 transition-all duration-500" />
              {data.cta}
              <span className="w-0 h-px bg-white/40 group-hover:w-4 transition-all duration-500" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
