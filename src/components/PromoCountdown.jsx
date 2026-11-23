"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "react-toastify";
import { client, urlFor } from "../../sanity";
import { saveUnlockedReward } from "@/lib/promoVaultStorage";

export default function PromoCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 42,
    seconds: 18,
  });

  const [promoData, setPromoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPromoData = async () => {
      try {
        const query = `*[_type == "promoCountdown" && active == true][0]{
          _id,
          title,
          subtitle,
          code,
          endDate,
          backgroundImage,
          active
        }`;
        const data = await client.fetch(query);
        setPromoData(data || null);
      } catch (error) {
        console.error("[PROMO] Error fetching:", error);
        setPromoData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoData();
  }, []);

  useEffect(() => {
    const computeRemaining = () => {
      if (promoData?.endDate) {
        const diff = Math.max(
          0,
          new Date(promoData.endDate).getTime() - Date.now()
        );
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
        return;
      }
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    computeRemaining();
    const timer = setInterval(computeRemaining, 1000);
    return () => clearInterval(timer);
  }, [promoData?.endDate]);

  if (loading || !promoData) {
    return null;
  }

  const backdropUrl = promoData.backgroundImage?.asset?._ref
    ? urlFor(promoData.backgroundImage).width(1920).height(1080).url()
    : "/images/atelier-fabric.jpg";

  const handleCopy = async () => {
    if (!promoData.code) return;

    saveUnlockedReward({
      code: promoData.code,
      offerLabel: promoData.subtitle || promoData.title,
      gameName: "Drop Release",
    });

    try {
      await navigator.clipboard?.writeText(promoData.code);
      setCopied(true);
      toast.success(`Archive code ${promoData.code} copied & saved for checkout`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.success(`Archive code ${promoData.code} saved for checkout`);
    }
  };

  const timeUnits = [
    { index: "01", value: timeLeft.hours, label: "Hours" },
    { index: "02", value: timeLeft.minutes, label: "Minutes" },
    { index: "03", value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-[#0A0A0A] text-[#F4F2ED] border-t border-white/[0.12]">
      {/* Subtle Full-Bleed Atmospheric Backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src={backdropUrl}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-[0.18]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/85 via-transparent to-[#0A0A0A]/85" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-mono-tech text-[10px] tracking-[0.38em] uppercase text-[#8E8B84] block mb-5">
            Archive Dispatch // Limited Drop Window
          </span>

          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-semibold tracking-[-0.02em] text-[#F4F2ED] mb-2">
            {promoData.title}
          </h2>

          {promoData.subtitle && (
            <p className="font-display italic text-3xl sm:text-5xl md:text-6xl font-normal tracking-[-0.02em] mb-8 text-[#8E8B84]">
              {promoData.subtitle}
            </p>
          )}

          {promoData.code && (
            <div className="flex items-center justify-center flex-wrap gap-3 font-mono-tech text-[11px] text-[#8E8B84] tracking-[0.18em] uppercase mb-10 sm:mb-12">
              <span>Use archive code</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#141414]/90 border border-white/[0.26] hover:bg-[#F4F2ED] hover:text-[#0A0A0A] hover:border-[#F4F2ED] rounded-none text-[#F4F2ED] font-mono-tech font-semibold tracking-[0.22em] transition-colors cursor-pointer"
              >
                <span>{promoData.code}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-75" />
                )}
              </button>
              <span>at checkout (click to auto-save)</span>
            </div>
          )}

          {/* Crisp Swiss Chronograph Digit Boxes */}
          <div className="flex justify-center items-start gap-3 sm:gap-5 md:gap-7 mb-10 sm:mb-14">
            {timeUnits.map((unit, index) => (
              <div
                key={unit.label}
                className="flex items-center gap-3 sm:gap-5 md:gap-7"
              >
                <div className="flex flex-col items-center">
                  <div className="relative bg-[#111111]/90 backdrop-blur-sm border border-white/[0.16] rounded-none px-5 sm:px-8 py-4 sm:py-6 min-w-[82px] sm:min-w-[122px]">
                    <span className="pointer-events-none absolute top-1.5 left-2 font-mono-tech text-[7px] tracking-[0.24em] text-white/30">
                      {unit.index}
                    </span>
                    <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/[0.06]" />
                    <span className="relative z-10 font-mono-tech text-3xl sm:text-5xl md:text-6xl font-light tracking-wider text-[#F4F2ED] tabular-nums">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="font-mono-tech text-[9px] tracking-[0.3em] uppercase mt-3 text-[#8E8B84]">
                    {unit.label}
                  </span>
                </div>
                {index < timeUnits.length - 1 && (
                  <span className="font-mono-tech text-2xl sm:text-4xl font-light text-white/30 -mt-6">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/shop?onSale=true"
            className="group inline-flex items-center gap-3 bg-[#F4F2ED] text-[#0A0A0A] px-10 sm:px-12 py-4 font-mono-tech text-[11px] font-semibold tracking-[0.26em] uppercase rounded-none border border-[#F4F2ED] hover:bg-transparent hover:text-[#F4F2ED] transition-colors duration-300"
          >
            <span>Shop The Release</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
