"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "react-toastify";
import { GAME_CATALOG, getUnlockedReward } from "@/lib/promoVaultStorage";

const REWARD_PLAQUES = [
  { tier: "TIER I", headline: "UP TO 12% OFF", note: "Private Archive Rate" },
  { tier: "TIER II", headline: "₹150 CREDIT", note: "Instant Bag Deduction" },
  { tier: "TIER III", headline: "FREE EXPRESS", note: "Priority India Dispatch" },
];

export default function AtelierVaultSection({ onOpenVault, gameSettings }) {
  const [activeReward, setActiveReward] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const syncReward = () => {
      setActiveReward(getUnlockedReward());
    };

    syncReward();
    window.addEventListener("mystique-reward-updated", syncReward);
    window.addEventListener("storage", syncReward);

    return () => {
      window.removeEventListener("mystique-reward-updated", syncReward);
      window.removeEventListener("storage", syncReward);
    };
  }, []);

  // Respect Sanity admin disable toggle
  if (gameSettings?.promotionalGames?.enabled === false) {
    return null;
  }

  const activeGameId =
    gameSettings?.promotionalGames?.activeGame || "mystery-box";
  const activeGame =
    GAME_CATALOG[activeGameId] || GAME_CATALOG["mystery-box"];

  const handleCopyCode = async () => {
    if (!activeReward?.code) return;
    try {
      await navigator.clipboard.writeText(activeReward.code);
      setCopied(true);
      toast.success(`Archive code ${activeReward.code} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info(`Archive code: ${activeReward.code}`);
    }
  };

  return (
    <section
      id="atelier-vault"
      className="relative overflow-hidden bg-[#0A0A0A] text-[#F4F2ED] border-t border-white/[0.12] py-20 sm:py-28 scroll-mt-20"
    >
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT (5 COLS): Bespoke Architectural Vault Plate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative bg-[#0F0F0F] border border-white/[0.16] p-6 sm:p-8 overflow-hidden">
              {/* Subtle Textile Backdrop */}
              <img
                src="/images/atelier-fabric.jpg"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-[0.22]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/85 via-[#0A0A0A]/60 to-[#0A0A0A]/90" />

              {/* Corner Registration Marks */}
              <span className="pointer-events-none absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-[#F4F2ED]/40" />
              <span className="pointer-events-none absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-[#F4F2ED]/40" />
              <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-[#F4F2ED]/40" />
              <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-[#F4F2ED]/40" />

              {/* Plate Header */}
              <div className="relative z-10 flex items-center justify-between gap-3 pb-4 border-b border-white/[0.12]">
                <span className="font-mono-tech text-[9px] tracking-[0.28em] uppercase text-[#8E8B84]">
                  ACTIVE EDITION
                </span>
                <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#0A0A0A]/85 border border-white/[0.18] font-mono-tech text-[9px] tracking-[0.22em] uppercase text-[#F4F2ED]">
                  <span className="w-1.5 h-1.5 bg-[#F4F2ED]" />
                  {activeGame.shortName}
                </span>
              </div>

              {/* Engraved Minimalist Geometric Atelier Vault Seal SVG */}
              <div className="relative z-10 py-8 sm:py-10 flex items-center justify-center">
                <svg
                  viewBox="0 0 240 240"
                  className="w-52 h-52 sm:w-60 sm:h-60 text-[#F4F2ED]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Mystique Atelier Vault Seal"
                >
                  {/* Outer Architectural Hairline Ring */}
                  <circle
                    cx="120"
                    cy="120"
                    r="110"
                    stroke="currentColor"
                    strokeOpacity="0.22"
                    strokeWidth="1"
                  />
                  {/* Precision Dashed Bezel */}
                  <circle
                    cx="120"
                    cy="120"
                    r="98"
                    stroke="currentColor"
                    strokeOpacity="0.35"
                    strokeWidth="0.75"
                    strokeDasharray="2 6"
                  />
                  {/* Mid Seal Circle */}
                  <circle
                    cx="120"
                    cy="120"
                    r="76"
                    stroke="currentColor"
                    strokeOpacity="0.28"
                    strokeWidth="1"
                  />
                  {/* Inner Monogram Medallion */}
                  <circle
                    cx="120"
                    cy="120"
                    r="48"
                    fill="#0A0A0A"
                    fillOpacity="0.75"
                    stroke="currentColor"
                    strokeOpacity="0.55"
                    strokeWidth="1"
                  />

                  {/* 12 Compass Ticks */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const isCardinal = i % 3 === 0;
                    const r1 = isCardinal ? 101 : 104;
                    const r2 = 110;
                    const x1 = 120 + Math.cos(angle) * r1;
                    const y1 = 120 + Math.sin(angle) * r1;
                    const x2 = 120 + Math.cos(angle) * r2;
                    const y2 = 120 + Math.sin(angle) * r2;
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        strokeOpacity={isCardinal ? "0.8" : "0.3"}
                        strokeWidth={isCardinal ? "1.25" : "0.75"}
                      />
                    );
                  })}

                  {/* Geometric Diamond Crosshairs */}
                  <polygon
                    points="120,38 124,44 120,50 116,44"
                    fill="currentColor"
                    fillOpacity="0.75"
                  />
                  <polygon
                    points="120,190 124,196 120,202 116,196"
                    fill="currentColor"
                    fillOpacity="0.75"
                  />
                  <line
                    x1="28"
                    y1="120"
                    x2="62"
                    y2="120"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="0.75"
                  />
                  <line
                    x1="178"
                    y1="120"
                    x2="212"
                    y2="120"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="0.75"
                  />

                  {/* Engraved Top & Bottom Registration Labels */}
                  <text
                    x="120"
                    y="66"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity="0.6"
                    fontSize="7"
                    letterSpacing="3.2"
                    fontFamily="monospace"
                  >
                    VAULT // EST. 2024
                  </text>
                  <text
                    x="120"
                    y="181"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity="0.6"
                    fontSize="7"
                    letterSpacing="3.2"
                    fontFamily="monospace"
                  >
                    PRIVATE ACCESS
                  </text>

                  {/* Embossed Central M Monogram */}
                  <text
                    x="120"
                    y="134"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="44"
                    fontStyle="italic"
                    fontFamily="Georgia, serif"
                    letterSpacing="-1"
                  >
                    M
                  </text>
                </svg>
              </div>

              {/* Plate Footer */}
              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/[0.12] font-mono-tech text-[9px] tracking-[0.24em] uppercase text-[#8E8B84]">
                <span>{activeGame.code}</span>
                <span>EST. {activeGame.duration}</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT (7 COLS): Editorial Narrative, Reward Plaques & Vault Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-7"
          >
            <div>
              <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#8E8B84] block mb-3">
                04.5 // Private Archive Privileges
              </span>
              <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-[#F4F2ED] leading-[1.02]">
                The Atelier Vault
              </h2>
              <div className="mt-4 flex items-center gap-3 font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#F4F2ED]/80">
                <span className="w-6 h-px bg-[#F4F2ED]/45" />
                <span>Featured Challenge: {activeGame.name}</span>
              </div>
              <p className="font-body text-sm sm:text-[15px] text-[#8E8B84] leading-[1.8] mt-3 max-w-xl">
                {activeGame.tagline} Complete the challenge to claim a personal
                archive privilege code that saves automatically to your bag.
              </p>
            </div>

            {/* 3 Sharp Hairline Reward Tier Plaques */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {REWARD_PLAQUES.map((item) => (
                <div
                  key={item.tier}
                  className="bg-[#111111] border border-white/[0.14] px-4 py-4 rounded-none"
                >
                  <span className="font-mono-tech text-[8px] tracking-[0.28em] uppercase text-[#8E8B84] block mb-1.5">
                    {item.tier}
                  </span>
                  <p className="font-mono-tech text-xs sm:text-[13px] font-semibold tracking-[0.16em] uppercase text-[#F4F2ED]">
                    {item.headline}
                  </p>
                  <p className="font-body text-[11px] text-[#8E8B84] mt-1">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>

            {/* Active Privilege Pass OR Direct Vault Entry */}
            {activeReward ? (
              <div className="bg-[#121212] border border-white/[0.22] p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.1]">
                  <span className="inline-flex items-center gap-2 font-mono-tech text-[9px] tracking-[0.28em] uppercase text-[#F4F2ED]">
                    <span className="w-1.5 h-1.5 bg-[#F4F2ED]" />
                    Active Privilege Pass
                  </span>
                  <span className="font-mono-tech text-[9px] tracking-[0.22em] uppercase text-[#8E8B84]">
                    {activeReward.offerLabel || "Private Archive Privilege"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0A0A] border border-dashed border-white/[0.26] px-4 py-3.5">
                  <div>
                    <span className="font-mono-tech text-[8px] tracking-[0.28em] uppercase text-[#8E8B84] block mb-1">
                      Saved Checkout Code
                    </span>
                    <code className="font-mono-tech text-xl sm:text-2xl font-semibold tracking-[0.24em] text-[#F4F2ED]">
                      {activeReward.code}
                    </code>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/[0.24] text-[#F4F2ED] hover:bg-[#F4F2ED] hover:text-[#0A0A0A] hover:border-[#F4F2ED] font-mono-tech text-[10px] font-semibold tracking-[0.22em] uppercase transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Copied" : "Copy Code"}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    href="/shop"
                    className="group inline-flex items-center justify-center gap-3 bg-[#F4F2ED] text-[#0A0A0A] px-7 py-3.5 rounded-none font-mono-tech text-[10px] font-semibold tracking-[0.24em] uppercase border border-[#F4F2ED] hover:bg-transparent hover:text-[#F4F2ED] transition-colors duration-300"
                  >
                    <span>Shop &amp; Apply</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => onOpenVault?.()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/[0.22] text-[#F4F2ED] hover:border-[#F4F2ED] hover:bg-white/[0.04] font-mono-tech text-[10px] font-medium tracking-[0.24em] uppercase transition-colors cursor-pointer"
                  >
                    <span>Open Vault</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onOpenVault?.()}
                    className="group inline-flex items-center justify-center gap-3.5 bg-[#F4F2ED] text-[#0A0A0A] px-9 sm:px-11 py-4 rounded-none font-mono-tech text-[11px] font-semibold tracking-[0.24em] uppercase border border-[#F4F2ED] hover:bg-transparent hover:text-[#F4F2ED] transition-colors duration-300 cursor-pointer"
                  >
                    <span>Enter The Vault</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                <p className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#8E8B84]">
                  No account required — code auto-saves for checkout
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
