"use client";

import { useState, useEffect } from "react";
import { client } from "@/sanity";
import HeroNew from "@/components/HeroNew";
import MarqueeBanner from "@/components/MarqueeBanner";
import TrendingProducts from "@/components/TrendingProducts";
import Categories from "@/components/Categories";
import AtelierCraft from "@/components/AtelierCraft";
import LookbookShowcase from "@/components/LookbookShowcase";
import PromoCountdown from "@/components/PromoCountdown";
import EditorialSection from "@/components/EditorialSection";
import Newsletter from "@/components/Newsletter";
import PromoGameSelector from "@/components/PromoGameSelector";

export default function HomePage() {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "siteSettings"][0] {
            promotionalGames {
              enabled,
              activeGame,
              autoOpenDelay,
              showFloatingButton
            }
          }`
        );
        setGameSettings(data);
      } catch (error) {
        console.error("Error fetching game settings:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D]">
        {/* CHAPTER I — CINEMA NOIR: Monumental 3D Campaign Hero & Spec Ticker */}
        <div className="bg-[#0A0A0A] text-[#F4F2ED]">
          <HeroNew />
          <MarqueeBanner />
        </div>

        {/* CHAPTER II — STUDIO ALABASTER: Curated Drops & Silhouette Directory */}
        <div className="bg-[#F6F5F1] text-[#0D0D0D]">
          <div className="py-16 sm:py-22 md:py-28 px-4 sm:px-6 lg:px-8 relative z-20">
            <TrendingProducts />
          </div>

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hairline-light" />
          </div>

          <div className="py-16 sm:py-22 md:py-28 px-4 sm:px-6 lg:px-8 relative z-20">
            <Categories />
          </div>
        </div>

        {/* CHAPTER III — CINEMA NOIR: Material Architecture, Lookbook & Drop Event */}
        <div className="bg-[#0A0A0A] text-[#F4F2ED]">
          <AtelierCraft />
          <LookbookShowcase />
          <PromoCountdown />
        </div>

        {/* CHAPTER IV — STUDIO ALABASTER: Brand Philosophy & The Private List */}
        <div className="bg-[#F6F5F1] text-[#0D0D0D]">
          <EditorialSection />
          <Newsletter />
        </div>

        {/* Floating Monochrome Square Mystery Rewards Trigger (Sanity-controlled) */}
        {gameSettings?.promotionalGames?.showFloatingButton && (
          <button
            type="button"
            onClick={() => setIsGameOpen(true)}
            className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 w-12 h-12 sm:w-14 sm:h-14 rounded-none flex items-center justify-center z-40 group bg-[#0D0D0D] text-[#F4F2ED] border border-white/25 hover:bg-[#F4F2ED] hover:text-[#0D0D0D] hover:border-[#0D0D0D] transition-colors duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
            title="Unlock Mystery Rewards"
            aria-label="Unlock Mystery Rewards"
          >
            <span className="font-mono-tech text-base sm:text-lg transition-transform duration-300 group-hover:scale-110">
              ⬢
            </span>
          </button>
        )}
      </div>

      {/* Promo Game Selector */}
      <PromoGameSelector
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
      />
    </>
  );
}
