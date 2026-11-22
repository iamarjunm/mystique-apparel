"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { client, urlFor } from "../../sanity";
import { fetchProducts } from "@/lib/fetchProducts";
import formatCurrency from "@/lib/formatCurrency";
import Hero3DCanvas from "@/components/Hero3DCanvas";

const DEFAULT_HERO = {
  heading1: "Embrace",
  heading2: "The Void",
  description:
    "240 GSM heavyweight silhouettes. Architectural drop-shoulder cuts. Crafted in small batches for those who move in shadow.",
  ctaText: "Explore The Archive",
  ctaLink: "/shop",
  backgroundImage: null,
};

const DEFAULT_DOSSIER = {
  slug: null,
  tag: "240 GSM // DROP 04",
  title: "Obsidian Monolith Tee",
  subtitle: "Boxy Drop-Shoulder • Enzyme Washed",
  price: null,
  image: "/images/atelier-fabric.jpg",
};

export default function HeroNew() {
  const heroRef = useRef(null);
  const cardRef = useRef(null);

  const [heroData, setHeroData] = useState(DEFAULT_HERO);
  const [dossier, setDossier] = useState(DEFAULT_DOSSIER);
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50, active: false });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const query = `*[_type == "heroSection"][0]{
          _id,
          heading1,
          heading2,
          description,
          ctaText,
          ctaLink,
          backgroundImage
        }`;
        const data = await client.fetch(query);
        if (data) {
          setHeroData({ ...DEFAULT_HERO, ...data });
        }
      } catch (error) {
        console.error("[HERO] Error fetching heroSection:", error);
      }
    };

    const fetchFeaturedDossier = async () => {
      try {
        const products = await fetchProducts();
        if (!Array.isArray(products) || products.length === 0) return;
        const pick =
          products.find((p) => p.featured && p.totalStock > 0) ||
          products.find((p) => p.bestseller && p.totalStock > 0) ||
          products[0];
        if (!pick) return;

        const slugValue =
          typeof pick.slug === "string"
            ? pick.slug
            : pick.slug?.current || pick.id;

        setDossier({
          slug: slugValue,
          tag: pick.newArrival
            ? "NEW RELEASE // 240 GSM"
            : pick.bestseller
            ? "ARCHIVE ICON // 240 GSM"
            : "ATELIER SPEC // DROP 04",
          title: pick.title,
          subtitle: "100% Combed Cotton • Oversized Cut",
          price: pick.price,
          image: pick.frontImage || pick.images?.[0] || "/images/atelier-fabric.jpg",
        });
      } catch (err) {
        console.error("[HERO] Error fetching featured dossier:", err);
      }
    };

    fetchHeroData();
    fetchFeaturedDossier();
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.14]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  // Global mouse parallax for multi-layer 3D depth
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const stageTiltX = useSpring(rawTiltX, { stiffness: 55, damping: 26 });
  const stageTiltY = useSpring(rawTiltY, { stiffness: 55, damping: 26 });
  const rawBgX = useMotionValue(0);
  const rawBgY = useMotionValue(0);
  const bgParallaxX = useSpring(rawBgX, { stiffness: 45, damping: 28 });
  const bgParallaxY = useSpring(rawBgY, { stiffness: 45, damping: 28 });

  // Local 3D tilt for the floating Garment Spec Dossier card
  const rawCardRotX = useMotionValue(0);
  const rawCardRotY = useMotionValue(0);
  const cardRotX = useSpring(rawCardRotX, { stiffness: 180, damping: 22 });
  const cardRotY = useSpring(rawCardRotY, { stiffness: 180, damping: 22 });

  useEffect(() => {
    const handleMouse = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      rawTiltX.set(-ny * 5);
      rawTiltY.set(nx * 5);
      rawBgX.set(nx * -22);
      rawBgY.set(ny * -18);
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [rawTiltX, rawTiltY, rawBgX, rawBgY]);

  const handleCardMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rawCardRotX.set((0.5 - py) * 14);
    rawCardRotY.set((px - 0.5) * 16);
    setSheenPos({ x: px * 100, y: py * 100, active: true });
  };

  const handleCardLeave = () => {
    rawCardRotX.set(0);
    rawCardRotY.set(0);
    setSheenPos((prev) => ({ ...prev, active: false }));
  };

  const bgImageUrl = heroData.backgroundImage?.asset?._ref
    ? urlFor(heroData.backgroundImage).width(1920).height(1200).url()
    : "/images/hero-campaign.jpg";

  const dossierHref = dossier.slug ? `/product/${dossier.slug}` : "/shop";

  return (
    <section
      ref={heroRef}
      style={{ perspective: "1200px" }}
      className="relative -mt-[96px] pt-[96px] min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#0A0A0A] text-[#F4F2ED]"
    >
      {/* BACK LAYER: Campaign Photography with Noir Contrast Grading */}
      <motion.div
        className="absolute inset-0 z-0 origin-center"
        style={{
          y: bgY,
          scale: bgScale,
          x: bgParallaxX,
        }}
      >
        <img
          src={bgImageUrl}
          alt="Mystique Apparel Autumn-Winter Campaign"
          className="w-full h-full object-cover object-center opacity-[0.42] saturate-[0.25] contrast-[1.12]"
        />
        {/* Cinema Noir directional lighting scrims */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/35 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/92 via-[#0A0A0A]/45 to-[#0A0A0A]/65" />
      </motion.div>

      {/* Monochrome Film Grain */}
      <div className="absolute inset-0 z-[1] opacity-[0.045] noise-overlay pointer-events-none" />

      {/* Architectural Hairline Registration Grid */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute top-0 left-6 lg:left-12 w-px h-full bg-white/[0.07] hidden md:block" />
        <div className="absolute top-0 right-6 lg:right-12 w-px h-full bg-white/[0.07] hidden md:block" />
        <div className="absolute top-[96px] inset-x-0 h-px bg-white/[0.08]" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.12]" />
      </div>

      {/* MID LAYER: Real-Time Interactive 3D WebGL Brushed-Obsidian & Chrome Sculpture */}
      <motion.div
        style={{
          y: bgParallaxY,
          rotateX: stageTiltX,
          rotateY: stageTiltY,
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-y-0 right-[-12%] sm:right-[-6%] lg:right-[2%] w-[115%] sm:w-[78%] lg:w-[58%] xl:w-[54%] z-[3] pointer-events-none flex items-center justify-center opacity-[0.72] sm:opacity-[0.88] lg:opacity-95"
      >
        <div className="relative w-full h-[78%] max-w-[780px] max-h-[780px]">
          <Hero3DCanvas />
        </div>
      </motion.div>

      {/* TOP EDITORIAL REGISTRATION BAR */}
      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-5 sm:px-8 lg:px-14 pt-6 sm:pt-9 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <span className="w-1.5 h-1.5 bg-[#F4F2ED]" />
          <span className="font-mono-tech text-[10px] tracking-[0.28em] uppercase text-[#F4F2ED]">
            01 // Season Archive
          </span>
          <span className="hidden sm:inline-block w-8 h-px bg-white/25" />
          <span className="hidden sm:inline-block font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#8E8B84]">
            Est. 2024
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="hidden sm:flex items-center gap-5 font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#8E8B84]"
        >
          <span>240 GSM Heavyweight</span>
          <span className="w-px h-3 bg-white/20" />
          <span className="text-[#F4F2ED]/80">Small-Batch India</span>
        </motion.div>
      </div>

      {/* FOREGROUND LAYER: Asymmetric High-Fashion Editorial Composition */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 max-w-[1380px] w-full mx-auto px-5 sm:px-8 lg:px-14 my-auto py-12 sm:py-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          {/* Left Monumental Typography & Actions */}
          <div className="lg:col-span-8">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono-tech text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-[#8E8B84] mb-5 sm:mb-6"
            >
              Noir Atelier × Architectural Streetwear
            </motion.p>

            <h1 className="flex flex-col items-start">
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                  className="block font-display text-[3.5rem] xs:text-[4.25rem] sm:text-[5.75rem] md:text-[7rem] lg:text-[8.25rem] font-semibold tracking-[-0.03em] uppercase text-[#F4F2ED] leading-[0.88]"
                >
                  {heroData.heading1}
                </motion.span>
              </span>

              <span className="overflow-hidden block mt-1 sm:mt-2 pl-0 sm:pl-10 lg:pl-16">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.95,
                    delay: 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="block font-display italic text-[3.5rem] xs:text-[4.25rem] sm:text-[5.75rem] md:text-[7rem] lg:text-[8.25rem] font-normal tracking-[-0.02em] text-[#F4F2ED] leading-[0.94]"
                >
                  {heroData.heading2}
                </motion.span>
              </span>
            </h1>

            {/* Hairline Accent & Subcopy */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 sm:mt-9 flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-7 max-w-xl"
            >
              <span className="w-12 h-px bg-[#F4F2ED]/40 mt-2.5 flex-shrink-0" />
              <p className="font-body text-[#F4F2ED]/75 text-xs sm:text-sm md:text-[15px] leading-[1.85] font-light tracking-[0.02em]">
                {heroData.description}
              </p>
            </motion.div>

            {/* Stark Monochrome CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 sm:mt-11 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <Link
                href={heroData.ctaLink || "/shop"}
                className="group inline-flex items-center justify-center gap-3.5 bg-[#F4F2ED] text-[#0A0A0A] px-8 sm:px-10 py-4 rounded-none font-mono-tech text-[11px] font-semibold tracking-[0.24em] uppercase border border-[#F4F2ED] hover:bg-transparent hover:text-[#F4F2ED] transition-colors duration-300"
              >
                <span>{heroData.ctaText || "Explore The Archive"}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2.5 bg-transparent text-[#F4F2ED] px-8 sm:px-9 py-4 rounded-none font-mono-tech text-[11px] font-medium tracking-[0.24em] uppercase border border-white/[0.22] hover:border-[#F4F2ED] hover:bg-[#F4F2ED]/[0.06] transition-colors duration-300"
              >
                <span>The Manifesto</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Bottom: Interactive 3D-Tilt Floating Garment Spec Dossier Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex lg:col-span-4 justify-end"
          >
            <motion.div
              ref={cardRef}
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
              style={{
                rotateX: cardRotX,
                rotateY: cardRotY,
                transformStyle: "preserve-3d",
              }}
              className="w-[310px] relative will-change-transform"
            >
              <Link
                href={dossierHref}
                className="group block relative bg-[#111111]/95 border border-white/[0.14] hover:border-[#F4F2ED]/50 transition-colors duration-300 p-4 rounded-none overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
              >
                {/* Dynamic Monochrome Hover Sheen */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                  style={{
                    opacity: sheenPos.active ? 1 : 0,
                    background: `radial-gradient(240px circle at ${sheenPos.x}% ${sheenPos.y}%, rgba(244,242,237,0.12), transparent 70%)`,
                  }}
                />

                {/* Top Spec Header */}
                <div
                  style={{ transform: "translateZ(18px)" }}
                  className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.1]"
                >
                  <span className="font-mono-tech text-[9px] tracking-[0.26em] uppercase text-[#8E8B84]">
                    {dossier.tag}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#F4F2ED] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                {/* Inner Garment Plate + Specs */}
                <div
                  style={{ transform: "translateZ(24px)" }}
                  className="flex items-center gap-4"
                >
                  <div className="w-20 h-24 flex-shrink-0 bg-[#1A1A1A] border border-white/[0.1] overflow-hidden">
                    <img
                      src={dossier.image}
                      alt={dossier.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-mono-tech text-[8px] tracking-[0.28em] uppercase text-[#8E8B84]">
                      Featured Plate
                    </p>
                    <h3 className="font-display italic text-lg text-[#F4F2ED] leading-snug line-clamp-1">
                      {dossier.title}
                    </h3>
                    <p className="font-body text-[11px] text-[#8E8B84] line-clamp-1">
                      {dossier.subtitle}
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="font-mono-tech text-xs text-[#F4F2ED] font-medium">
                        {dossier.price ? formatCurrency(dossier.price) : "240 GSM SPEC"}
                      </span>
                      <span className="font-mono-tech text-[9px] tracking-[0.2em] uppercase text-[#F4F2ED]/70 group-hover:text-[#F4F2ED]">
                        Inspect →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* BOTTOM ARCHITECTURAL STATUS BAR */}
      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-5 sm:px-8 lg:px-14 pb-6 sm:pb-8 pt-4 border-t border-white/[0.1] flex items-center justify-between gap-4">
        <div className="hidden md:flex items-center gap-7 font-mono-tech text-[10px] tracking-[0.2em] uppercase">
          <div>
            <span className="text-[#8E8B84] block text-[8px] mb-0.5">TEXTILE</span>
            <span className="text-[#F4F2ED]">100% Combed Cotton</span>
          </div>
          <div className="w-px h-6 bg-white/[0.12]" />
          <div>
            <span className="text-[#8E8B84] block text-[8px] mb-0.5">SILHOUETTE</span>
            <span className="text-[#F4F2ED]">Boxy Drop-Shoulder</span>
          </div>
          <div className="w-px h-6 bg-white/[0.12]" />
          <div>
            <span className="text-[#8E8B84] block text-[8px] mb-0.5">INTERACTIVE</span>
            <span className="text-[#F4F2ED]">Move Cursor To Orbit 3D</span>
          </div>
        </div>

        {/* Minimalist Scroll Cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mx-auto md:mx-0 flex items-center gap-3"
        >
          <span className="font-mono-tech text-[9px] tracking-[0.34em] uppercase text-[#8E8B84]">
            Scroll To Enter Gallery
          </span>
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="inline-block w-px h-5 bg-[#F4F2ED]/60"
          />
        </motion.div>

        <div className="hidden md:block text-right font-mono-tech text-[10px] tracking-[0.2em] uppercase">
          <span className="text-[#8E8B84] block text-[8px] mb-0.5">DISPATCH</span>
          <span className="text-[#F4F2ED]">Pan-India Express</span>
        </div>
      </div>
    </section>
  );
}
