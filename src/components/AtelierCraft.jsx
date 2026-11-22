"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const WOVEN_SPECS = [
  {
    index: "01",
    code: "SPEC // TEXTILE",
    title: "240–280 GSM Combed Cotton",
    description:
      "Dense, long-staple 100% combed ring-spun cotton knitted for architectural structure. Holds its sculptural volume and resists twisting wash after wash.",
    metric: "240–280",
    unit: "GSM WEIGHT",
  },
  {
    index: "02",
    code: "SPEC // PATTERN",
    title: "Drop-Shoulder Boxy Block",
    description:
      "Custom-drafted extended shoulder line, calibrated chest ease, and reinforced 2.5cm double-stitched rib collar engineered for quiet command.",
    metric: "BOXY",
    unit: "SILHOUETTE",
  },
  {
    index: "03",
    code: "SPEC // FINISH",
    title: "Enzyme Bio-Washed",
    description:
      "Pre-shrunk and bio-polished with natural enzymes for a dry, matte-obsidian handfeel, deep pigment lock, and zero surface pilling.",
    metric: "0%",
    unit: "SHRINK / PILL",
  },
  {
    index: "04",
    code: "SPEC // ORIGIN",
    title: "Small-Batch India Runs",
    description:
      "Cut, stitched, and individually QC-checked in disciplined micro-editions across our partner ateliers in India. Zero mass overproduction.",
    metric: "LIMITED",
    unit: "NUMBERED",
  },
];

export default function AtelierCraft() {
  const [selectedGsm, setSelectedGsm] = useState("mystique");

  const isMystique = selectedGsm === "mystique";

  return (
    <section className="relative py-20 sm:py-28 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#0A0A0A] text-[#F4F2ED] border-t border-white/[0.12]">
      <div className="max-w-[1380px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 sm:pb-10 mb-10 sm:mb-14 border-b border-white/[0.12]"
        >
          <div className="max-w-2xl">
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#8E8B84] block mb-2.5">
              03 // Garment Engineering
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-[#F4F2ED] leading-[1.08]">
              Built With <span className="italic font-normal">Obsessive Weight</span>
            </h2>
          </div>

          <p className="font-body text-xs sm:text-sm text-[#8E8B84] max-w-md leading-relaxed font-light">
            True luxury streetwear begins with raw textile density. Every Mystique silhouette is specified from yarn twist to collar rib tension.
          </p>
        </motion.div>

        {/* Editorial Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Macro Fabric Plate + Interactive GSM Comparator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Framed Macro Fabric Photography with Architectural Registration Marks */}
            <div className="relative bg-[#141414] border border-white/[0.12] p-3 sm:p-4 rounded-none">
              {/* Top Registration Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.1] font-mono-tech text-[9px] tracking-[0.26em] uppercase text-[#8E8B84]">
                <span>PLATE A // TEXTILE MACRO</span>
                <span className="text-[#F4F2ED]">100% COMBED COTTON</span>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden bg-[#0E0E0E] border border-white/[0.08]">
                <img
                  src="/images/atelier-fabric.jpg"
                  alt="240 GSM Heavyweight Combed Cotton Macro Study"
                  loading="lazy"
                  className="w-full h-full object-cover contrast-[1.06] saturate-[0.3]"
                />
                {/* Corner Architectural Hairline Crosshairs */}
                <span className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#F4F2ED]/60" />
                <span className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-[#F4F2ED]/60" />
                <span className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#F4F2ED]/60" />
                <span className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#F4F2ED]/60" />

                <div className="absolute bottom-3 left-3 bg-[#0A0A0A]/90 border border-white/[0.14] px-2.5 py-1">
                  <span className="font-mono-tech text-[9px] tracking-[0.24em] uppercase text-[#F4F2ED]">
                    WEAVE DENSITY: 240+ GSM
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Standard 160 GSM vs Mystique 240+ GSM Comparator */}
            <div className="bg-[#141414] border border-white/[0.12] p-5 sm:p-7 rounded-none space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.1]">
                <div>
                  <span className="font-mono-tech text-[9px] tracking-[0.28em] uppercase text-[#8E8B84] block">
                    Interactive Bench Test
                  </span>
                  <h3 className="font-display italic text-xl text-[#F4F2ED] mt-0.5">
                    Fabric Weight &amp; Collar Spec
                  </h3>
                </div>

                {/* Stark Monochrome Toggle */}
                <div className="inline-flex border border-white/[0.16] rounded-none bg-[#0A0A0A] self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedGsm("standard")}
                    className={`px-3.5 py-2 font-mono-tech text-[9px] uppercase tracking-[0.2em] transition-colors ${
                      !isMystique
                        ? "bg-[#F4F2ED] text-[#0A0A0A] font-semibold"
                        : "text-[#8E8B84] hover:text-[#F4F2ED]"
                    }`}
                  >
                    Standard 160 GSM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGsm("mystique")}
                    className={`px-3.5 py-2 font-mono-tech text-[9px] uppercase tracking-[0.2em] border-l border-white/[0.16] transition-colors ${
                      isMystique
                        ? "bg-[#F4F2ED] text-[#0A0A0A] font-semibold"
                        : "text-[#8E8B84] hover:text-[#F4F2ED]"
                    }`}
                  >
                    Mystique 240+ GSM
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {/* Bar 1: Drape & Structure */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-body text-[#8E8B84]">
                      Fabric Density &amp; Architectural Drape
                    </span>
                    <span className="font-mono-tech text-[11px] text-[#F4F2ED]">
                      {isMystique ? "240–280 GSM • Structured" : "150–160 GSM • Clingy"}
                    </span>
                  </div>
                  <div className="w-full h-[3px] bg-white/[0.1] overflow-hidden">
                    <motion.div
                      animate={{ width: isMystique ? "94%" : "46%" }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full ${isMystique ? "bg-[#F4F2ED]" : "bg-[#8E8B84]"}`}
                    />
                  </div>
                </div>

                {/* Bar 2: Collar Retention */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-body text-[#8E8B84]">
                      Collar Rib Tension &amp; Recovery
                    </span>
                    <span className="font-mono-tech text-[11px] text-[#F4F2ED]">
                      {isMystique
                        ? "2.5cm Double-Stitched Rib"
                        : "Thin Single-Needle Band"}
                    </span>
                  </div>
                  <div className="w-full h-[3px] bg-white/[0.1] overflow-hidden">
                    <motion.div
                      animate={{ width: isMystique ? "96%" : "40%" }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full ${isMystique ? "bg-[#F4F2ED]" : "bg-[#8E8B84]"}`}
                    />
                  </div>
                </div>

                {/* Bar 3: Opacity & Wash Longevity */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-body text-[#8E8B84]">
                      Pigment Depth After 50 Washes
                    </span>
                    <span className="font-mono-tech text-[11px] text-[#F4F2ED]">
                      {isMystique ? "Enzyme-Locked Obsidian" : "Fades & Twists"}
                    </span>
                  </div>
                  <div className="w-full h-[3px] bg-white/[0.1] overflow-hidden">
                    <motion.div
                      animate={{ width: isMystique ? "92%" : "44%" }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full ${isMystique ? "bg-[#F4F2ED]" : "bg-[#8E8B84]"}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 4 Stark Woven-Label Specification Rows */}
          <div className="lg:col-span-6 border-t border-white/[0.12]">
            {WOVEN_SPECS.map((spec, idx) => (
              <motion.div
                key={spec.index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.65,
                  delay: idx * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group py-7 sm:py-8 border-b border-white/[0.12] flex flex-col sm:flex-row sm:items-start justify-between gap-5 transition-colors hover:bg-white/[0.02] px-2 sm:px-3"
              >
                <div className="space-y-2.5 max-w-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tech text-[10px] tracking-[0.25em] text-[#F4F2ED] border border-white/[0.18] px-2 py-0.5">
                      {spec.index}
                    </span>
                    <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#8E8B84]">
                      {spec.code}
                    </span>
                  </div>

                  <h3 className="font-display italic text-2xl sm:text-[26px] text-[#F4F2ED] font-normal leading-snug">
                    {spec.title}
                  </h3>

                  <p className="font-body text-xs sm:text-[13px] text-[#8E8B84] leading-[1.8] font-light">
                    {spec.description}
                  </p>
                </div>

                {/* Right Woven Label Stamp */}
                <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0 pt-1">
                  <span className="font-mono-tech text-lg sm:text-xl font-semibold text-[#F4F2ED] tracking-tight">
                    {spec.metric}
                  </span>
                  <span className="font-mono-tech text-[9px] tracking-[0.24em] uppercase text-[#8E8B84]">
                    {spec.unit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
