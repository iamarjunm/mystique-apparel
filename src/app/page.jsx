"use client";

import { useState, useEffect } from "react";
import { client } from "@/sanity";
import { getUnlockedReward } from "@/lib/promoVaultStorage";
import HeroNew from "@/components/HeroNew";
import MarqueeBanner from "@/components/MarqueeBanner";
import TrendingProducts from "@/components/TrendingProducts";
import Categories from "@/components/Categories";
import AtelierCraft from "@/components/AtelierCraft";
import LookbookShowcase from "@/components/LookbookShowcase";
import AtelierVaultSection from "@/components/AtelierVaultSection";
import PromoCountdown from "@/components/PromoCountdown";
import EditorialSection from "@/components/EditorialSection";
import Newsletter from "@/components/Newsletter";
import PromoGameSelector from "@/components/PromoGameSelector";

export default function HomePage() {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState(null);
  const [activeReward, setActiveReward] = useState(null);

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

  const showFloatingVaultTab =
    gameSettings?.promotionalGames?.showFloatingButton !== false &&
    gameSettings?.promotionalGames?.enabled !== false;

  return (
    <>
      <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D]">
        {/* CHAPTER I — CINEMA NOIR: 3-Slide Luxury Campaign Hero & Spec Ticker */}
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

        {/* CHAPTER III — CINEMA NOIR: Material Architecture, Lookbook, Vault & Drop Event */}
        <div className="bg-[#0A0A0A] text-[#F4F2ED]">
          <AtelierCraft />
          <LookbookShowcase />
          <AtelierVaultSection
            onOpenVault={() => setIsGameOpen(true)}
            gameSettings={gameSettings}
          />
          <PromoCountdown />
        </div>

        {/* CHAPTER IV — STUDIO ALABASTER: Brand Philosophy & The Private List */}
        <div className="bg-[#F6F5F1] text-[#0D0D0D]">
          <EditorialSection />
          <Newsletter />
        </div>

        {/* Sleek Monochrome Architectural Floating Vault Trigger */}
        {showFloatingVaultTab && (
          <button
            type="button"
            onClick={() => setIsGameOpen(true)}
            className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 group inline-flex items-center gap-2.5 bg-[#0A0A0A] text-[#F4F2ED] border border-white/[0.22] hover:bg-[#F4F2ED] hover:text-[#0A0A0A] hover:border-[#F4F2ED] px-4 py-3 rounded-none transition-colors duration-300 shadow-[0_14px_36px_rgba(0,0,0,0.42)] cursor-pointer"
            title={
              activeReward
                ? `Active Privilege Code: ${activeReward.code}`
                : "Enter The Atelier Vault"
            }
            aria-label={
              activeReward ? "View Active Privilege Code" : "Enter The Atelier Vault"
            }
          >
            <span className="font-mono-tech text-[11px] leading-none transition-transform duration-300 group-hover:rotate-45">
              ◆
            </span>
            <span className="font-mono-tech text-[10px] font-semibold tracking-[0.24em] uppercase">
              {activeReward ? "Code Active" : "The Vault"}
            </span>
            {activeReward && (
              <span className="w-1.5 h-1.5 bg-[#F4F2ED] group-hover:bg-[#0A0A0A]" />
            )}
          </button>
        )}
      </div>

      {/* Promo Game Selector & Non-Blocking Invitation */}
      <PromoGameSelector
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
      />
    </>
  );
}
