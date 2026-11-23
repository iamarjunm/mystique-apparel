"use client";

import React, { useEffect, useRef, useState } from "react";
import { client } from "@/sanity";
import { createGameDiscount } from "@/lib/promoOfferFactory";
import {
  AtelierGameShell,
  AtelierRewardTicket,
} from "@/components/games/AtelierGameShell";

const BASE_TIERS = [
  "low",
  "low",
  "low",
  "standard",
  "standard",
  "standard",
  "high",
  "high",
  "high",
];

function createShuffledCoffers() {
  const tiers = [...BASE_TIERS];
  for (let i = tiers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
  }
  return tiers.map((tier, idx) => ({
    index: idx,
    label: String(idx + 1).padStart(2, "0"),
    tier,
  }));
}

function generateDiscountCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "MYSTIQUE";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const MysteryBoxGame = ({
  onClose,
  allowReplay = true,
  recordGamePlay = () => {},
}) => {
  const [coffers, setCoffers] = useState(() => createShuffledCoffers());
  const [selectedBox, setSelectedBox] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedBoxes, setRevealedBoxes] = useState(() => new Set());
  const [gameResult, setGameResult] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  const isMountedRef = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleBoxClick = async (index) => {
    if (revealedBoxes.has(index) || isRevealing || gameResult) return;

    setSelectedBox(index);
    setIsRevealing(true);
    setGameCompleted(true);
    recordGamePlay();

    const coffer = coffers[index];
    const newCode = generateDiscountCode();
    let offerLabel = "Private Archive Privilege";

    try {
      const offer = await createGameDiscount(client, {
        code: newCode,
        gameName: "The Archive Coffers",
        tier: coffer.tier,
      });
      if (offer?.label) {
        offerLabel = offer.label;
      }
    } catch (error) {
      console.error("Error creating discount:", error);
    }

    timerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setRevealedBoxes((prev) => new Set([...prev, index]));
      setGameResult({
        code: newCode,
        offerLabel,
        cofferLabel: coffer.label,
      });
      setIsRevealing(false);
    }, 900);
  };

  const handlePlayAgain = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCoffers(createShuffledCoffers());
    setGameResult(null);
    setSelectedBox(null);
    setIsRevealing(false);
    setRevealedBoxes(new Set());
  };

  return (
    <AtelierGameShell
      codeLabel="01 // ARCHIVE COFFERS"
      title="The Archive Coffers"
      subtitle="Select one of nine sealed obsidian crates to unveil your private code."
      onClose={() => onClose(gameCompleted)}
    >
      {gameResult ? (
        <AtelierRewardTicket
          code={gameResult.code}
          offerLabel={gameResult.offerLabel}
          gameName="The Archive Coffers"
          metaNote={`COFFER ${gameResult.cofferLabel} // UNSEALED`}
          allowReplay={allowReplay}
          onPlayAgain={handlePlayAgain}
          onClose={() => onClose(gameCompleted)}
        />
      ) : (
        <div className="space-y-6">
          {/* Status Strip */}
          <div className="flex items-center justify-between border-b border-white/[0.12] pb-3 font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#8E8B84]">
            <span>
              {isRevealing
                ? `UNSEALING COFFER ${String((selectedBox ?? 0) + 1).padStart(2, "0")}`
                : "SELECT ONE SEALED CRATE"}
            </span>
            <span>09 UNITS</span>
          </div>

          {/* 3x3 Obsidian Crate Grid */}
          <div className="grid grid-cols-3 gap-3">
            {coffers.map((coffer) => {
              const isSelected = selectedBox === coffer.index;
              const isOpened = revealedBoxes.has(coffer.index);
              const isUnlocking = isSelected && isRevealing;

              return (
                <button
                  key={coffer.index}
                  type="button"
                  onClick={() => handleBoxClick(coffer.index)}
                  disabled={isOpened || isRevealing}
                  className={`group relative h-24 sm:h-28 rounded-none border transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
                    isUnlocking
                      ? "bg-[#F4F2ED] text-[#0A0A0A] border-[#F4F2ED]"
                      : isOpened
                        ? "bg-[#121212] text-[#8E8B84] border-white/[0.12] opacity-50"
                        : "bg-[#121212] text-[#F4F2ED] border-white/[0.14] hover:bg-[#1A1A1A] hover:border-[#F4F2ED]/70 disabled:opacity-35 disabled:cursor-not-allowed"
                  }`}
                >
                  {/* Corner Crosshairs */}
                  <span
                    className={`pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t border-l transition-colors ${
                      isUnlocking
                        ? "border-[#0A0A0A]/50"
                        : "border-white/[0.2] group-hover:border-[#F4F2ED]/70"
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t border-r transition-colors ${
                      isUnlocking
                        ? "border-[#0A0A0A]/50"
                        : "border-white/[0.2] group-hover:border-[#F4F2ED]/70"
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l transition-colors ${
                      isUnlocking
                        ? "border-[#0A0A0A]/50"
                        : "border-white/[0.2] group-hover:border-[#F4F2ED]/70"
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r transition-colors ${
                      isUnlocking
                        ? "border-[#0A0A0A]/50"
                        : "border-white/[0.2] group-hover:border-[#F4F2ED]/70"
                    }`}
                  />

                  {/* Subtle Brushed Texture Diagonal Line */}
                  <span
                    className={`pointer-events-none absolute inset-x-4 top-1/2 h-px transition-opacity ${
                      isUnlocking
                        ? "bg-[#0A0A0A]/15 opacity-100"
                        : "bg-white/[0.06] group-hover:bg-[#F4F2ED]/20"
                    }`}
                  />

                  {isUnlocking ? (
                    <div className="relative z-10 flex flex-col items-center gap-2 px-3 w-full">
                      <span className="font-mono-tech text-lg font-semibold tracking-[0.2em]">
                        {coffer.label}
                      </span>
                      <div className="w-full h-[2px] bg-[#0A0A0A]/20 overflow-hidden">
                        <div className="h-full w-full bg-[#0A0A0A] animate-pulse" />
                      </div>
                      <span className="font-mono-tech text-[8px] tracking-[0.28em] uppercase">
                        UNSEALING
                      </span>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                      <span className="font-mono-tech text-xl sm:text-2xl font-normal tracking-[0.18em] transition-transform duration-300 group-hover:scale-105">
                        {coffer.label}
                      </span>
                      <span className="font-mono-tech text-[8px] tracking-[0.3em] uppercase text-[#8E8B84] group-hover:text-[#F4F2ED] transition-colors">
                        {isOpened ? "OPENED" : "SEALED"}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Unlocking Progress Bar */}
          <div className="space-y-2 pt-1">
            <div className="w-full h-[2px] bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#F4F2ED] transition-all duration-700 ease-out"
                style={{ width: isRevealing ? "100%" : "0%" }}
              />
            </div>
            <p className="font-mono-tech text-[9px] tracking-[0.24em] uppercase text-[#8E8B84] text-center">
              {isRevealing
                ? "VERIFYING ARCHIVAL CREDENTIALS..."
                : "EACH COFFER CONTAINS A SINGLE-USE PRIVATE CODE"}
            </p>
          </div>
        </div>
      )}
    </AtelierGameShell>
  );
};

export default MysteryBoxGame;
