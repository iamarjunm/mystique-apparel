"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { client } from "../../sanity";

export default function PromoCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  const [promoData, setPromoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromoData = async () => {
      try {
        const query = `*[_type == "promoCountdown" && active == true][0]{
          _id,
          title,
          subtitle,
          code,
          backgroundImage,
          active
        }`;
        const data = await client.fetch(query);
        setPromoData(data || null);
      } catch (error) {
        console.error('[PROMO] Error fetching:', error);
        setPromoData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoData();
  }, []);



  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0)
          return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Don't render anything while loading or if no promo data
  if (loading || !promoData) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white border-y border-white/10">
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%221%22 fill-rule=%22evenodd%22%3E%3Ccircle cx=%223%22 cy=%223%22 r=%223%22/%3E%3Ccircle cx=%2213%22 cy=%2213%22 r=%223%22/%3E%3C/g%3E%3C/svg%3E")',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3 sm:mb-4 text-white">
            {promoData.title} <br />
            <span style={{ WebkitTextStroke: "2px white" }} className="text-transparent">
              {promoData.subtitle}
            </span>
          </h2>
          <p className="text-white/60 text-[10px] sm:text-xs md:text-sm tracking-[0.2em] uppercase mb-6 sm:mb-8 max-w-xl mx-auto font-bold">
            Exclusive 24-hour flash sale. Use code{" "}
            <span className="bg-white text-black px-2 py-1 mx-1">{promoData.code}</span> at
            checkout.
          </p>

          {/* Countdown Timer */}
          <div className="flex justify-center gap-1.5 sm:gap-3 md:gap-6 mb-6 sm:mb-8 flex-wrap">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-mono font-bold">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[7px] sm:text-[9px] md:text-[10px] tracking-[0.2em] uppercase mt-0.5 sm:mt-1 font-bold">
                Hours
              </span>
            </div>
            <span className="text-2xl sm:text-4xl md:text-5xl font-mono font-bold animate-pulse">
              :
            </span>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-mono font-bold">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[7px] sm:text-[9px] md:text-[10px] tracking-[0.2em] uppercase mt-0.5 sm:mt-1 font-bold">
                Minutes
              </span>
            </div>
            <span className="text-2xl sm:text-4xl md:text-5xl font-mono font-bold animate-pulse">
              :
            </span>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-mono font-bold">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[7px] sm:text-[9px] md:text-[10px] tracking-[0.2em] uppercase mt-0.5 sm:mt-1 font-bold">
                Seconds
              </span>
            </div>
          </div>

          <Link
            href="/shop"
            className="inline-block bg-white text-black px-6 sm:px-8 md:px-12 py-2.5 sm:py-3 md:py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-gray-200 transition-colors duration-300"
          >
            Shop The Sale
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
