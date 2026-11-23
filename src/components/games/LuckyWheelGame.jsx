"use client";

import React, { useEffect, useRef, useState } from "react";
import { client } from "@/sanity";
import {
  AtelierGameShell,
  AtelierRewardTicket,
} from "@/components/games/AtelierGameShell";

const WHEEL_SEGMENTS = [
  {
    code: "01",
    fill: "#0B0B0B",
    shortLabel: "₹100 OFF",
    fullLabel: "₹100 OFF on orders above ₹999",
    offerData: {
      discountType: "fixed",
      fixedAmountOff: 100,
      minimumPurchaseAmount: 999,
    },
  },
  {
    code: "02",
    fill: "#171717",
    shortLabel: "FREE SHIP",
    fullLabel: "Free Shipping on orders above ₹799",
    offerData: {
      discountType: "freeShipping",
      minimumPurchaseAmount: 799,
    },
  },
  {
    code: "03",
    fill: "#101010",
    shortLabel: "5% OFF",
    fullLabel: "5% OFF on orders above ₹799",
    offerData: {
      discountType: "percentage",
      percentageOff: 5,
      minimumPurchaseAmount: 799,
    },
  },
  {
    code: "04",
    fill: "#1E1E1E",
    shortLabel: "8% OFF",
    fullLabel: "8% OFF on orders above ₹999",
    offerData: {
      discountType: "percentage",
      percentageOff: 8,
      minimumPurchaseAmount: 999,
    },
  },
  {
    code: "05",
    fill: "#0E0E0E",
    shortLabel: "₹100 OFF",
    fullLabel: "₹100 OFF on orders above ₹1299",
    offerData: {
      discountType: "fixed",
      fixedAmountOff: 100,
      minimumPurchaseAmount: 1299,
    },
  },
  {
    code: "06",
    fill: "#242424",
    shortLabel: "FREE SHIP",
    fullLabel: "Free Shipping on orders above ₹999",
    offerData: {
      discountType: "freeShipping",
      minimumPurchaseAmount: 999,
    },
  },
  {
    code: "07",
    fill: "#141414",
    shortLabel: "10% OFF",
    fullLabel: "10% OFF on orders above ₹1499",
    offerData: {
      discountType: "percentage",
      percentageOff: 10,
      minimumPurchaseAmount: 1499,
    },
  },
  {
    code: "08",
    fill: "#2A2A2A",
    shortLabel: "₹150 OFF",
    fullLabel: "₹150 OFF on orders above ₹1799",
    offerData: {
      discountType: "fixed",
      fixedAmountOff: 150,
      minimumPurchaseAmount: 1799,
    },
  },
];

const SEGMENT_COUNT = WHEEL_SEGMENTS.length;
const SLICE_DEG = 360 / SEGMENT_COUNT;

function generateDiscountCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "LUCKY";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const LuckyWheelGame = ({
  onClose,
  allowReplay = true,
  recordGamePlay = () => {},
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningIndex, setWinningIndex] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  const isMountedRef = useRef(true);
  const spinTimerRef = useRef(null);
  const revealTimerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const createOfferFromSegment = async (code, segment) => {
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await client.create({
      _type: "discountCode",
      code,
      description: `The Monolith Dial reward: ${segment.fullLabel}`,
      appliesTo: "entireOrder",
      usageLimit: 1,
      usageLimitPerCustomer: 1,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      isActive: true,
      timesUsed: 0,
      ...segment.offerData,
    });
  };

  const handleSpin = () => {
    if (isSpinning || gameResult) return;

    setIsSpinning(true);
    setGameCompleted(true);
    recordGamePlay();
    setWinningIndex(null);

    // Choose target wedge and compute exact landing rotation so the top pointer lands cleanly inside it
    const targetIndex = Math.floor(Math.random() * SEGMENT_COUNT);
    const desiredMod = (360 - targetIndex * SLICE_DEG) % 360;
    const jitter = (Math.random() - 0.5) * 20; // stays comfortably within the 45deg wedge
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = (((desiredMod + jitter - currentMod) % 360) + 360) % 360;
    const newRotation = rotation + 360 * 6 + delta;

    setRotation(newRotation);

    spinTimerRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      const winningSegment = WHEEL_SEGMENTS[targetIndex];
      setWinningIndex(targetIndex);
      setIsSpinning(false);

      const newCode = generateDiscountCode();
      let offerLabel = winningSegment.fullLabel;

      try {
        await createOfferFromSegment(newCode, winningSegment);
      } catch (error) {
        console.error("Error creating discount:", error);
      }

      revealTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setGameResult({
          code: newCode,
          offerLabel,
          segmentCode: winningSegment.code,
          shortLabel: winningSegment.shortLabel,
        });
      }, 650);
    }, 3650);
  };

  const handlePlayAgain = () => {
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    setGameResult(null);
    setWinningIndex(null);
    setIsSpinning(false);
  };

  // Precompute 72 outer watch-bezel degree ticks
  const bezelTicks = Array.from({ length: 72 }, (_, i) => {
    const deg = i * 5;
    const rad = ((deg - 90) * Math.PI) / 180;
    const isMajor = deg % 45 === 0;
    const rOuter = 114;
    const rInner = isMajor ? 105 : 109.5;
    return {
      x1: 120 + rInner * Math.cos(rad),
      y1: 120 + rInner * Math.sin(rad),
      x2: 120 + rOuter * Math.cos(rad),
      y2: 120 + rOuter * Math.sin(rad),
      isMajor,
    };
  });

  return (
    <AtelierGameShell
      codeLabel="03 // CHRONOGRAPH"
      title="The Monolith Dial"
      subtitle="Set the precision bezel in motion to lock in an exclusive privilege."
      maxWidth="max-w-3xl"
      onClose={() => onClose(gameCompleted)}
    >
      {gameResult ? (
        <AtelierRewardTicket
          code={gameResult.code}
          offerLabel={gameResult.offerLabel}
          gameName="The Monolith Dial"
          metaNote={`INDEX ${gameResult.segmentCode} // ${gameResult.shortLabel}`}
          allowReplay={allowReplay}
          onPlayAgain={handlePlayAgain}
          onClose={() => onClose(gameCompleted)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Architectural Watch-Bezel SVG Dial */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-[272px] h-[272px] sm:w-[324px] sm:h-[324px]">
              {/* Top Precision Pointer Triangle */}
              <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <polygon points="8,15 1,1 15,1" fill="#F4F2ED" />
                </svg>
              </div>

              {/* Static Outer Bezel Frame & Degree Ticks */}
              <svg
                viewBox="0 0 240 240"
                className="pointer-events-none absolute inset-0 w-full h-full z-10"
              >
                <circle
                  cx="120"
                  cy="120"
                  r="117"
                  fill="none"
                  stroke="rgba(244,242,237,0.22)"
                  strokeWidth="1"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="102"
                  fill="none"
                  stroke="rgba(244,242,237,0.14)"
                  strokeWidth="0.75"
                />
                {bezelTicks.map((tick, idx) => (
                  <line
                    key={idx}
                    x1={tick.x1}
                    y1={tick.y1}
                    x2={tick.x2}
                    y2={tick.y2}
                    stroke={
                      tick.isMajor
                        ? "rgba(244,242,237,0.72)"
                        : "rgba(244,242,237,0.24)"
                    }
                    strokeWidth={tick.isMajor ? "1.1" : "0.6"}
                  />
                ))}
              </svg>

              {/* Rotating 8-Wedge Monolith Rotor */}
              <svg
                viewBox="0 0 240 240"
                className="w-full h-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning
                    ? "transform 3.6s cubic-bezier(0.12, 0.88, 0.24, 1)"
                    : "none",
                }}
              >
                {WHEEL_SEGMENTS.map((segment, index) => {
                  const centerDeg = index * SLICE_DEG - 90;
                  const startDeg = centerDeg - SLICE_DEG / 2;
                  const endDeg = centerDeg + SLICE_DEG / 2;
                  const r = 100;

                  const x1 = 120 + r * Math.cos((startDeg * Math.PI) / 180);
                  const y1 = 120 + r * Math.sin((startDeg * Math.PI) / 180);
                  const x2 = 120 + r * Math.cos((endDeg * Math.PI) / 180);
                  const y2 = 120 + r * Math.sin((endDeg * Math.PI) / 180);

                  const tx = 120 + 64 * Math.cos((centerDeg * Math.PI) / 180);
                  const ty = 120 + 64 * Math.sin((centerDeg * Math.PI) / 180);
                  const nx = 120 + 88 * Math.cos((centerDeg * Math.PI) / 180);
                  const ny = 120 + 88 * Math.sin((centerDeg * Math.PI) / 180);

                  const isWinner = winningIndex === index;

                  return (
                    <g key={segment.code}>
                      <path
                        d={`M 120 120 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                        fill={isWinner ? "#F4F2ED" : segment.fill}
                        stroke={
                          isWinner ? "#F4F2ED" : "rgba(244,242,237,0.16)"
                        }
                        strokeWidth={isWinner ? "1.5" : "0.8"}
                      />
                      {/* Micro Index Numeral Near Rim */}
                      <text
                        x={nx}
                        y={ny}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="5.5"
                        fontFamily="JetBrains Mono, ui-monospace, monospace"
                        letterSpacing="0.8"
                        fill={
                          isWinner ? "#0A0A0A" : "rgba(244,242,237,0.48)"
                        }
                        transform={`rotate(${centerDeg + 90} ${nx} ${ny})`}
                      >
                        {segment.code}
                      </text>
                      {/* Clean Radial Privilege Label */}
                      <text
                        x={tx}
                        y={ty}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="7.5"
                        fontWeight="600"
                        fontFamily="JetBrains Mono, ui-monospace, monospace"
                        letterSpacing="0.6"
                        fill={isWinner ? "#0A0A0A" : "#F4F2ED"}
                        transform={`rotate(${centerDeg + 90} ${tx} ${ty})`}
                      >
                        {segment.shortLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Center Bone-Ivory Medallion */}
              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#F4F2ED] border-[3px] border-[#0A0A0A] flex items-center justify-center shadow-[0_0_0_1px_rgba(244,242,237,0.35)]">
                <span className="font-display italic text-base text-[#0A0A0A] leading-none">
                  M
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Monochrome Reward Ledger + CTA */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.12] pb-2.5 font-mono-tech text-[10px] tracking-[0.28em] uppercase text-[#8E8B84]">
              <span>REWARD LEDGER</span>
              <span>08 PRIVILEGES</span>
            </div>

            <div className="divide-y divide-white/[0.08] border border-white/[0.14] bg-[#121212]">
              {WHEEL_SEGMENTS.map((segment, idx) => {
                const isLanded = winningIndex === idx;
                return (
                  <div
                    key={segment.code}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors duration-300 ${
                      isLanded
                        ? "bg-[#F4F2ED] text-[#0A0A0A]"
                        : "text-[#F4F2ED]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`font-mono-tech text-[10px] tracking-[0.2em] ${
                          isLanded ? "text-[#0A0A0A]/70" : "text-[#8E8B84]"
                        }`}
                      >
                        {segment.code}
                      </span>
                      <span className="font-body text-xs truncate">
                        {segment.fullLabel}
                      </span>
                    </div>
                    <span
                      className={`font-mono-tech text-[9px] tracking-[0.2em] uppercase flex-shrink-0 ${
                        isLanded ? "text-[#0A0A0A] font-semibold" : "text-[#8E8B84]"
                      }`}
                    >
                      {segment.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full py-4 px-6 bg-[#F4F2ED] text-[#0A0A0A] hover:bg-white disabled:bg-[#1A1A1A] disabled:text-[#8E8B84] disabled:border disabled:border-white/[0.14] disabled:cursor-not-allowed font-mono-tech text-[11px] font-semibold tracking-[0.28em] uppercase transition-colors rounded-none"
            >
              {isSpinning ? "CALIBRATING DIAL..." : "SPIN THE DIAL"}
            </button>
          </div>
        </div>
      )}
    </AtelierGameShell>
  );
};

export default LuckyWheelGame;
