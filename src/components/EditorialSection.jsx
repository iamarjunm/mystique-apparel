"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { client, urlFor } from "../../sanity";

const DEFAULT_EDITORIAL = {
  title: "Designed in The Shadows",
  description:
    "Mystique Apparel is not just clothing; it is a quiet statement of presence. We craft oversized silhouettes that command attention while maintaining an aura of restraint. Every piece is engineered with heavyweight 240 GSM combed cotton, precision drop-shoulder proportions, and bio-washed obsidian dyes. We don't chase trends — we build uniforms for those who walk their own path.",
  cta: "Read Our Story",
  image: "/images/editorial-atelier.jpg",
};

export default function EditorialSection() {
  const [sectionData, setSectionData] = useState(DEFAULT_EDITORIAL);

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
        if (data) {
          setSectionData({ ...DEFAULT_EDITORIAL, ...data });
        }
      } catch (error) {
        console.error("[EDITORIAL] Error fetching:", error);
      }
    };

    fetchSectionData();
  }, []);

  const resolvedImage =
    typeof sectionData.image === "string"
      ? sectionData.image
      : sectionData.image?.asset?._ref
      ? urlFor(sectionData.image).width(1000).height(1250).url()
      : "/images/editorial-atelier.jpg";

  return (
    <section className="py-20 sm:py-28 md:py-32 bg-[#F6F5F1] text-[#0D0D0D] relative overflow-hidden">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Sharp 4:5 Studio Stone Portrait Frame */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="bg-[#EAE8E2] border border-[#0D0D0D]/[0.12] p-3 sm:p-4 rounded-none">
              <div className="relative overflow-hidden aspect-[4/5] bg-[#DDDAD1] group">
                <img
                  src={resolvedImage}
                  alt={sectionData.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              </div>
              {/* Museum Plate Caption */}
              <div className="pt-3 mt-3 border-t border-[#0D0D0D]/[0.12] flex items-center justify-between font-mono-tech text-[9px] tracking-[0.26em] uppercase text-[#64625C]">
                <span>ATELIER PLATE // 05</span>
                <span className="text-[#0D0D0D]">INDIA • EST. 2024</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Editorial Manifesto */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 sm:space-y-8"
          >
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block">
              05 // Brand Philosophy
            </span>

            <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-[#0D0D0D] leading-[1.08]">
              &ldquo;{sectionData.title}&rdquo;
            </h2>

            <div className="w-16 h-px bg-[#0D0D0D]" />

            <p className="font-body text-[#64625C] text-sm sm:text-base md:text-[17px] leading-[1.9] font-normal max-w-2xl">
              {sectionData.description}
            </p>

            {/* 3-Stat Architectural Strip */}
            <div className="grid grid-cols-3 gap-5 pt-6 border-t border-[#0D0D0D]/[0.12] max-w-lg">
              <div>
                <p className="font-display italic text-2xl sm:text-3xl text-[#0D0D0D]">
                  240+ GSM
                </p>
                <p className="font-mono-tech text-[9px] tracking-[0.22em] uppercase text-[#64625C] mt-1">
                  Combed Cotton
                </p>
              </div>
              <div className="border-l border-[#0D0D0D]/[0.12] pl-4 sm:pl-5">
                <p className="font-display italic text-2xl sm:text-3xl text-[#0D0D0D]">
                  100% QC
                </p>
                <p className="font-mono-tech text-[9px] tracking-[0.22em] uppercase text-[#64625C] mt-1">
                  Hand Inspected
                </p>
              </div>
              <div className="border-l border-[#0D0D0D]/[0.12] pl-4 sm:pl-5">
                <p className="font-display italic text-2xl sm:text-3xl text-[#0D0D0D]">
                  EST. 2024
                </p>
                <p className="font-mono-tech text-[9px] tracking-[0.22em] uppercase text-[#64625C] mt-1">
                  India Atelier
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 px-9 py-4 rounded-none bg-[#0D0D0D] text-[#F4F2ED] border border-[#0D0D0D] hover:bg-transparent hover:text-[#0D0D0D] font-mono-tech text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
              >
                <span>{sectionData.cta || "Read Our Story"}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
