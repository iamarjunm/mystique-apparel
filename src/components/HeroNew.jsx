"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { client, urlFor } from "../../sanity";

export default function HeroNew() {
  const heroRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize client-side
  useEffect(() => {
    setIsClient(true);
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
        setHeroData(data || getDefaultHeroData());
      } catch (error) {
        console.error('[HERO] Error fetching:', error);
        setHeroData(getDefaultHeroData());
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  const getDefaultHeroData = () => ({
    heading1: "Embrace",
    heading2: "The Void",
    description: "Premium oversized silhouettes. Dark aesthetics. Uncompromising quality.",
    ctaText: "Explore Collection",
    ctaLink: "/shop",
    backgroundImage: null,
  });

  if (!isClient || loading) {
    return <div className="h-screen bg-black" />;
  }

  return <HeroContent ref={heroRef} data={heroData || getDefaultHeroData()} />;
}

const HeroContent = ({ data, ref }) => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={ref}
      className="relative h-[65vh] sm:h-[75vh] md:h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0 origin-center"
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
      >
        <img
          src={data.backgroundImage?.asset?._ref 
            ? urlFor(data.backgroundImage).width(1920).height(1080).url()
            : "https://images.unsplash.com/photo-1556821840-aa48b83bd079?w=1920&h=1080&fit=crop"}
          alt="Mystique Apparel Hero"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
      </motion.div>

      {/* Decorative Lines */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 w-full max-w-6xl mx-auto -mt-40 sm:-mt-36 md:-mt-24">
        {/* Heading Part 1 */}
        <div className="overflow-hidden mb-0 sm:mb-1">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-[-0.02em] uppercase text-white"
          >
            {data.heading1}
          </motion.h1>
        </div>

        {/* Heading Part 2 */}
        <div className="overflow-hidden mb-6 sm:mb-8">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-[-0.02em] uppercase text-transparent"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.6)" }}
          >
            {data.heading2}
          </motion.h1>
        </div>

        {/* Divider Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6 sm:mb-8"
        />

        {/* Description and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="flex flex-col items-center"
        >
          <p className="text-white/60 text-[10px] sm:text-xs md:text-sm max-w-xl mx-auto mb-6 sm:mb-8 tracking-[0.2em] uppercase leading-relaxed font-light">
            {data.description}
          </p>
          <Link
            href={data.ctaLink || "/shop"}
            className="group relative inline-flex items-center justify-center border border-white/20 bg-white/5 backdrop-blur-sm text-white px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase overflow-hidden transition-all duration-500 hover:bg-white hover:text-black hover:border-white"
          >
            <span className="relative z-10 transition-colors duration-300">
              {data.ctaText || "Explore Collection"}
            </span>
            <svg className="ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/40 font-light">
          Scroll
        </span>
        <div className="w-px h-10 sm:h-12 bg-gradient-to-b from-white/40 via-white/20 to-transparent" />
      </motion.div>
    </section>
  );
};
