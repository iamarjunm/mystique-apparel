"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Sparkles, ShieldCheck, Compass } from "lucide-react";
import Newsletter from "@/components/Newsletter";

const VALUES = [
  {
    index: "01",
    title: "Heavyweight Architecture",
    desc: "We reject thin blanks. Every silhouette starts with 240+ GSM combed cotton engineered to hold sculptural volume.",
    icon: Layers,
  },
  {
    index: "02",
    title: "Restrained Intensity",
    desc: "Dark minimalism with quiet edge — pieces that speak through proportion, weight, and surface finish rather than noise.",
    icon: Compass,
  },
  {
    index: "03",
    title: "Small-Batch Integrity",
    desc: "Produced in disciplined limited runs across India, with every garment manually inspected prior to dispatch.",
    icon: ShieldCheck,
  },
  {
    index: "04",
    title: "Emotional Presence",
    desc: "Luxury is felt before it is seen. Every stitch and drop-shoulder cut is tailored to elevate how you carry yourself.",
    icon: Sparkles,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D]">
      {/* Cinema Noir Editorial Hero */}
      <section className="relative bg-[#0A0A0A] text-[#F4F2ED] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#F4F2ED]/12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="font-mono-tech text-[10px] tracking-[0.38em] uppercase text-[#8E8B84] block mb-5">
            The Atelier // Est. 2024
          </span>
          <h1 className="font-display italic text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.02em] leading-[1.06] text-[#F4F2ED] mb-6">
            Discover The Essence of Mystique
          </h1>
          <div className="w-16 h-px bg-[#F4F2ED]/30 mx-auto mb-6" />
          <p className="font-body text-sm sm:text-base md:text-lg text-[#8E8B84] leading-[1.85] max-w-2xl mx-auto font-light">
            Where architectural streetwear meets uncompromising heavyweight comfort. Created for the confident, the understated, and those who define their own silhouette.
          </p>
        </motion.div>
      </section>

      {/* Studio Alabaster Founders Story Spread */}
      <section className="bg-[#F6F5F1] text-[#0D0D0D] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-[2px] overflow-hidden aspect-[4/5] bg-[#EAE8E2] border border-[#0D0D0D]/12">
              <img
                src="/images/editorial-atelier.jpg"
                alt="Mystique Apparel Atelier"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/40 to-transparent p-6 pt-16">
                <p className="font-mono-tech text-[9px] tracking-[0.32em] uppercase text-[#F4F2ED]/70">
                  Founded In India
                </p>
                <p className="font-display italic text-2xl text-[#F4F2ED] mt-1">
                  Krishna &amp; Manan
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 bg-white border border-[#0D0D0D]/12 rounded-[2px] p-8 sm:p-11 space-y-6"
          >
            <span className="font-mono-tech text-[10px] tracking-[0.32em] uppercase text-[#64625C] block">
              Origin Story // 01
            </span>
            <h2 className="font-display italic text-3xl sm:text-4xl font-semibold text-[#0D0D0D] tracking-[-0.015em]">
              Born From Vision &amp; Obsession
            </h2>
            <div className="w-14 h-px bg-[#0D0D0D]/25" />
            <div className="space-y-4 font-body text-sm sm:text-base text-[#64625C] leading-[1.9]">
              <p>
                Mystique Apparel was born from the fusion of passion and raw ambition. Founded by two teenage entrepreneurs, <span className="text-[#0D0D0D] font-medium">Krishna and Manan</span>, while still in school, the label grew out of their refusal to settle for ordinary streetwear.
              </p>
              <p>
                Every garment in our archive is specified down to the finest detail — from 240+ GSM bio-washed cotton to reinforced collar ribs and drop-shoulder geometry. We don&apos;t chase fleeting hype; we craft timeless dark silhouettes that command quiet authority.
              </p>
              <p>
                When you wear Mystique, you step into a community built around authenticity, tactile weight, and luxury without compromise.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Four Pillars Architectural Grid */}
      <section className="bg-[#F6F5F1] text-[#0D0D0D] pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-[#0D0D0D]/12 pt-14 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono-tech text-[10px] tracking-[0.32em] uppercase text-[#64625C] block mb-2">
                Our Code // 02
              </span>
              <h2 className="font-display italic text-3xl sm:text-4xl font-semibold text-[#0D0D0D]">
                Built To Outlast Trends
              </h2>
            </div>
            <p className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C]">
              Four Architectural Standards
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#0D0D0D]/12">
            {VALUES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.index}
                  className="bg-white border-r border-b border-[#0D0D0D]/12 p-7 space-y-5 hover:bg-[#EAE8E2]/45 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-[10px] tracking-[0.25em] text-[#64625C]">
                      {item.index}
                    </span>
                    <Icon className="w-4 h-4 text-[#0D0D0D]" />
                  </div>
                  <h3 className="font-display italic text-xl text-[#0D0D0D]">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-[#64625C] leading-[1.75]">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cinema Noir Pull Quote */}
      <section className="bg-[#0A0A0A] text-[#F4F2ED] py-20 sm:py-28 px-4 sm:px-6 border-t border-[#F4F2ED]/12">
        <div className="max-w-4xl mx-auto text-center space-y-7">
          <span className="font-mono-tech text-[10px] tracking-[0.36em] uppercase text-[#8E8B84] block">
            Manifesto
          </span>
          <blockquote className="font-display italic text-3xl sm:text-4xl md:text-5xl text-[#F4F2ED] leading-[1.25]">
            “Luxury is in each detail. We redefine it every day.”
          </blockquote>
          <div className="w-20 h-px bg-[#F4F2ED]/25 mx-auto" />
          <div className="pt-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-[#F4F2ED] text-[#0A0A0A] px-9 py-4 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.25em] uppercase hover:bg-white transition-colors"
            >
              <span>Explore The Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
