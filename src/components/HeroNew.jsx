"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { client, urlFor } from "../../sanity";
import { fetchProducts } from "@/lib/fetchProducts";
import formatCurrency from "@/lib/formatCurrency";

const SLIDE_DURATION_MS = 6500;

const DEFAULT_HERO = {
  heading1: "Embrace",
  heading2: "The Void",
  description:
    "240 GSM heavyweight silhouettes. Architectural drop-shoulder cuts. Crafted in small batches for those who move in shadow.",
  ctaText: "Explore The Archive",
  ctaLink: "/shop",
  backgroundImage: null,
};

const DEFAULT_LOOK = {
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
  const [featuredLook, setFeaturedLook] = useState(DEFAULT_LOOK);
  const [activeSlide, setActiveSlide] = useState(0);
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

    const fetchFeaturedLook = async () => {
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

        setFeaturedLook({
          slug: slugValue,
          tag: pick.newArrival
            ? "NEW RELEASE // 240 GSM"
            : pick.bestseller
            ? "ARCHIVE ICON // 240 GSM"
            : "ATELIER SPEC // DROP 04",
          title: pick.title,
          subtitle: "100% Combed Cotton • Oversized Cut",
          price: pick.price,
          image:
            pick.frontImage || pick.images?.[0] || "/images/atelier-fabric.jpg",
        });
      } catch (err) {
        console.error("[HERO] Error fetching featured look:", err);
      }
    };

    fetchHeroData();
    fetchFeaturedLook();
  }, []);

  const slides = useMemo(() => {
    const primaryImage = heroData.backgroundImage?.asset?._ref
      ? urlFor(heroData.backgroundImage).width(1920).height(1200).url()
      : "/images/hero-campaign.jpg";

    return [
      {
        id: "the-void",
        navLabel: "01 / THE VOID",
        eyebrow: "01 // SEASON ARCHIVE — DROP 04",
        heading1: heroData.heading1 || DEFAULT_HERO.heading1,
        heading2: heroData.heading2 || DEFAULT_HERO.heading2,
        description: heroData.description || DEFAULT_HERO.description,
        image: primaryImage,
        imagePosition: "object-[70%_center] sm:object-center",
        alt: "Mystique Apparel Cinema Noir Campaign",
      },
      {
        id: "the-silhouette",
        navLabel: "02 / THE SILHOUETTE",
        eyebrow: "02 // ARCHITECTURAL WEIGHT",
        heading1: "Architectural",
        heading2: "Weight",
        description:
          "Heavyweight 280 GSM Fleece & Oversized Cuts — structured drop-shoulder tailoring engineered to hold form.",
        image: "/images/editorial-atelier.jpg",
        imagePosition: "object-[center_20%]",
        alt: "Mystique Apparel Heavyweight Silhouette Editorial",
      },
      {
        id: "240-gsm-craft",
        navLabel: "03 / 240 GSM CRAFT",
        eyebrow: "03 // MATERIAL STUDY — BIO-WASHED",
        heading1: "Crafted",
        heading2: "In Shadow",
        description:
          "100% Combed Ring-Spun Cotton — Bio-Washed for an obsidian matte finish and enduring archival structure.",
        image: "/images/atelier-fabric.jpg",
        imagePosition: "object-center",
        alt: "Mystique Apparel 240 GSM Combed Cotton Textile",
      },
    ];
  }, [heroData]);

  // Auto-advance every 6.5s; resets whenever user jumps to a slide
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeSlide, slides.length]);

  const currentSlide = slides[activeSlide] || slides[0];

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // Local 3D tilt for the compact bottom-right Live Look Card
  const rawCardRotX = useMotionValue(0);
  const rawCardRotY = useMotionValue(0);
  const cardRotX = useSpring(rawCardRotX, { stiffness: 180, damping: 22 });
  const cardRotY = useSpring(rawCardRotY, { stiffness: 180, damping: 22 });

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

  const handleScrollToVault = (e) => {
    const el = document.getElementById("atelier-vault");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const lookHref = featuredLook.slug ? `/product/${featuredLook.slug}` : "/shop";

  return (
    <section
      ref={heroRef}
      className="relative -mt-[96px] pt-[96px] min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#0A0A0A] text-[#F4F2ED]"
    >
      {/* FULL-CLARITY 3-SLIDE CINEMA PHOTOGRAPHY STAGE */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-0 overflow-hidden bg-[#0A0A0A]"
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 6.8, ease: "easeOut" },
            }}
            className="absolute inset-0 will-change-transform"
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.alt}
              className={`w-full h-full object-cover ${currentSlide.imagePosition} opacity-[0.88]`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Directional Left-Only Scrim so Right-Side Model & Garments Stay Razor-Sharp */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-[#0A0A0A]/35 to-transparent" />
        {/* Subtle Bottom & Top Edge Vignette for Navigation & Progress Bar Readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/92 via-transparent to-[#0A0A0A]/40" />
      </motion.div>

      {/* Subtle Cinema Film Grain */}
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.035] noise-overlay" />

      {/* Minimal Architectural Hairline Framing */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        <div className="absolute top-[96px] inset-x-0 h-px bg-white/[0.08]" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.12]" />
      </div>

      {/* TOP EDITORIAL REGISTRATION BAR */}
      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-5 sm:px-8 lg:px-14 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-[#F4F2ED]" />
          <span className="font-mono-tech text-[10px] tracking-[0.28em] uppercase text-[#F4F2ED]">
            Mystique Atelier
          </span>
          <span className="hidden sm:inline-block w-8 h-px bg-white/25" />
          <span className="hidden sm:inline-block font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#F4F2ED]/65">
            Est. 2024 // Archive
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#F4F2ED]/70">
          <span>240–280 GSM Heavyweight</span>
          <span className="w-px h-3 bg-white/25" />
          <span className="text-[#F4F2ED]">
            {String(activeSlide + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* FOREGROUND EDITORIAL COMPOSITION */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 max-w-[1380px] w-full mx-auto px-5 sm:px-8 lg:px-14 my-auto py-10 sm:py-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          {/* Left-Aligned Monumental Runway Typography */}
          <div className="lg:col-span-7 xl:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-mono-tech text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-[#F4F2ED]/75 mb-5 sm:mb-6">
                  {currentSlide.eyebrow}
                </p>

                <h1 className="flex flex-col items-start">
                  <span className="block font-display text-[3.35rem] xs:text-[4rem] sm:text-[5.4rem] md:text-[6.5rem] lg:text-[7.5rem] font-semibold tracking-[-0.03em] uppercase text-[#F4F2ED] leading-[0.88]">
                    {currentSlide.heading1}
                  </span>
                  <span className="block mt-1 sm:mt-2 pl-0 sm:pl-8 lg:pl-14 font-display italic text-[3.35rem] xs:text-[4rem] sm:text-[5.4rem] md:text-[6.5rem] lg:text-[7.5rem] font-normal tracking-[-0.02em] text-[#F4F2ED] leading-[0.94]">
                    {currentSlide.heading2}
                  </span>
                </h1>

                <div className="mt-7 sm:mt-8 flex items-start gap-5 max-w-lg">
                  <span className="w-10 h-px bg-[#F4F2ED]/45 mt-2.5 flex-shrink-0" />
                  <p className="font-body text-[#F4F2ED]/82 text-xs sm:text-sm md:text-[15px] leading-[1.8] font-light tracking-[0.015em]">
                    {currentSlide.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dual High-Contrast CTAs */}
            <div className="mt-9 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href={heroData.ctaLink || "/shop"}
                className="group inline-flex items-center justify-center gap-3.5 bg-[#F4F2ED] text-[#0A0A0A] px-8 sm:px-10 py-4 rounded-none font-mono-tech text-[11px] font-semibold tracking-[0.24em] uppercase border border-[#F4F2ED] hover:bg-transparent hover:text-[#F4F2ED] transition-colors duration-300"
              >
                <span>{heroData.ctaText || "Explore The Archive"}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href="#atelier-vault"
                onClick={handleScrollToVault}
                className="inline-flex items-center justify-center gap-2.5 bg-[#0A0A0A]/45 backdrop-blur-[3px] text-[#F4F2ED] px-8 sm:px-9 py-4 rounded-none font-mono-tech text-[11px] font-medium tracking-[0.24em] uppercase border border-white/[0.28] hover:border-[#F4F2ED] hover:bg-[#F4F2ED]/[0.1] transition-colors duration-300"
              >
                <span>The Vault</span>
              </a>
            </div>
          </div>

          {/* Bottom-Right (Desktop Only, Compact & Low): 3D Perspective-Tilting Live Look Card */}
          <div className="hidden lg:flex lg:col-span-5 justify-end items-end self-end">
            <div style={{ perspective: "1200px" }}>
              <motion.div
                ref={cardRef}
                onMouseMove={handleCardMove}
                onMouseLeave={handleCardLeave}
                style={{
                  rotateX: cardRotX,
                  rotateY: cardRotY,
                  transformStyle: "preserve-3d",
                }}
                className="w-[276px] relative will-change-transform"
              >
                <Link
                  href={lookHref}
                  className="group block relative bg-[#0A0A0A]/82 backdrop-blur-md border border-white/[0.18] hover:border-[#F4F2ED]/60 transition-colors duration-300 p-3.5 rounded-none overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
                >
                  {/* Specular Light Sweep */}
                  <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                    style={{
                      opacity: sheenPos.active ? 1 : 0,
                      background: `radial-gradient(220px circle at ${sheenPos.x}% ${sheenPos.y}%, rgba(244,242,237,0.16), transparent 70%)`,
                    }}
                  />

                  <div
                    style={{ transform: "translateZ(14px)" }}
                    className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.12]"
                  >
                    <span className="font-mono-tech text-[8px] tracking-[0.26em] uppercase text-[#8E8B84]">
                      {featuredLook.tag}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#F4F2ED] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  <div
                    style={{ transform: "translateZ(20px)" }}
                    className="flex items-center gap-3.5"
                  >
                    <div className="w-16 h-20 flex-shrink-0 bg-[#141414] border border-white/[0.12] overflow-hidden">
                      <img
                        src={featuredLook.image}
                        alt={featuredLook.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-mono-tech text-[8px] tracking-[0.26em] uppercase text-[#8E8B84]">
                        Live Look
                      </p>
                      <h2 className="font-display italic text-[15px] text-[#F4F2ED] leading-snug line-clamp-1">
                        {featuredLook.title}
                      </h2>
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <span className="font-mono-tech text-[11px] text-[#F4F2ED] font-medium">
                          {featuredLook.price
                            ? formatCurrency(featuredLook.price)
                            : "ARCHIVE SPEC"}
                        </span>
                        <span className="font-mono-tech text-[8px] tracking-[0.2em] uppercase text-[#F4F2ED]/75 group-hover:text-[#F4F2ED]">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BOTTOM ARCHITECTURAL SLIDE PROGRESS BARS */}
      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-5 sm:px-8 lg:px-14 pb-6 sm:pb-8 pt-4">
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {slides.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`View slide ${slide.navLabel}`}
                aria-current={isActive ? "true" : "false"}
                className="group text-left focus:outline-none py-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`font-mono-tech text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.26em] uppercase transition-colors duration-300 truncate ${
                      isActive
                        ? "text-[#F4F2ED]"
                        : "text-[#F4F2ED]/45 group-hover:text-[#F4F2ED]/80"
                    }`}
                  >
                    {slide.navLabel}
                  </span>
                </div>

                <div className="relative w-full h-[1.5px] bg-white/[0.18] overflow-hidden">
                  {isActive && (
                    <motion.span
                      key={`progress-${activeSlide}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: SLIDE_DURATION_MS / 1000,
                        ease: "linear",
                      }}
                      style={{ transformOrigin: "left center" }}
                      className="absolute inset-0 bg-[#F4F2ED]"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
