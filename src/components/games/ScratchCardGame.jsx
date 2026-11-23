"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { client } from "@/sanity";
import { createGameDiscount } from "@/lib/promoOfferFactory";
import {
  AtelierGameShell,
  AtelierRewardTicket,
} from "@/components/games/AtelierGameShell";

const TIER_POOL = ["low", "low", "standard", "standard", "high", "high"];
const REVEAL_THRESHOLD = 40;

function pickRandomTier() {
  return TIER_POOL[Math.floor(Math.random() * TIER_POOL.length)];
}

function generateDiscountCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "SCRATCH";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const ScratchCardGame = ({
  onClose,
  allowReplay = true,
  recordGamePlay = () => {},
}) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const hasRevealedRef = useRef(false);
  const isMountedRef = useRef(true);
  const timerRef = useRef(null);

  const [selectedTier, setSelectedTier] = useState(() => pickRandomTier());
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isUnveiling, setIsUnveiling] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  const drawFoilSurface = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth || 420;
    const height = canvas.offsetHeight || 220;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over";

    // Brushed titanium / silver metallic sheen (#1D1D1F -> #36363A)
    const sheen = ctx.createLinearGradient(0, 0, width, height);
    sheen.addColorStop(0, "#1D1D1F");
    sheen.addColorStop(0.28, "#2C2C30");
    sheen.addColorStop(0.5, "#36363A");
    sheen.addColorStop(0.75, "#252529");
    sheen.addColorStop(1, "#1D1D1F");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal brushed micro-lines
    ctx.strokeStyle = "rgba(244, 242, 237, 0.03)";
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }

    // Fine diagonal engraved architectural lines
    ctx.strokeStyle = "rgba(244, 242, 237, 0.065)";
    ctx.lineWidth = 1;
    for (let x = -height; x < width + height; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    // Inner engraved frame border
    ctx.strokeStyle = "rgba(244, 242, 237, 0.22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(12.5, 12.5, width - 25, height - 25);

    // Corner registration accents
    const mark = 10;
    ctx.strokeStyle = "rgba(244, 242, 237, 0.55)";
    ctx.beginPath();
    ctx.moveTo(12.5, 12.5 + mark);
    ctx.lineTo(12.5, 12.5);
    ctx.lineTo(12.5 + mark, 12.5);

    ctx.moveTo(width - 12.5 - mark, 12.5);
    ctx.lineTo(width - 12.5, 12.5);
    ctx.lineTo(width - 12.5, 12.5 + mark);

    ctx.moveTo(12.5, height - 12.5 - mark);
    ctx.lineTo(12.5, height - 12.5);
    ctx.lineTo(12.5 + mark, height - 12.5);

    ctx.moveTo(width - 12.5 - mark, height - 12.5);
    ctx.lineTo(width - 12.5, height - 12.5);
    ctx.lineTo(width - 12.5, height - 12.5 - mark);
    ctx.stroke();

    // Centered monospace engraving
    ctx.fillStyle = "rgba(244, 242, 237, 0.88)";
    ctx.font = '600 12px "JetBrains Mono", ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S C R A T C H   T O   U N V E I L", width / 2, height / 2 - 8);

    ctx.fillStyle = "rgba(244, 242, 237, 0.45)";
    ctx.font = '400 9px "JetBrains Mono", ui-monospace, SFMono-Regular, monospace';
    ctx.fillText("TI-02 // BRUSHED FOIL SEAL", width / 2, height / 2 + 14);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const frame = requestAnimationFrame(() => {
      drawFoilSurface();
    });
    return () => {
      isMountedRef.current = false;
      cancelAnimationFrame(frame);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [drawFoilSurface]);

  const revealResult = useCallback(async () => {
    if (hasRevealedRef.current) return;
    hasRevealedRef.current = true;

    isDrawingRef.current = false;
    lastPointRef.current = null;
    setIsUnveiling(true);
    setScratchPercentage(100);
    setGameCompleted(true);
    recordGamePlay();

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    const newCode = generateDiscountCode();
    let offerLabel = "Private Archive Privilege";

    try {
      const offer = await createGameDiscount(client, {
        code: newCode,
        gameName: "Silver Foil Plate",
        tier: selectedTier,
      });
      if (offer?.label) {
        offerLabel = offer.label;
      }
    } catch (error) {
      console.error("Error creating discount:", error);
    }

    timerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setGameResult({
        code: newCode,
        offerLabel,
      });
      setIsUnveiling(false);
    }, 450);
  }, [recordGamePlay, selectedTier]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const eraseStroke = (from, to) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 38;

    ctx.beginPath();
    if (from) {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else {
      ctx.arc(to.x, to.y, 19, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fill();
    }
  };

  const evaluateScratchProgress = () => {
    if (hasRevealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let sampled = 0;
    let cleared = 0;

    // Sample every 4th pixel for responsive 60fps etching
    for (let i = 3; i < data.length; i += 16) {
      sampled++;
      if (data[i] < 128) cleared++;
    }

    const pct = sampled > 0 ? (cleared / sampled) * 100 : 0;
    setScratchPercentage(pct);

    if (pct >= REVEAL_THRESHOLD) {
      revealResult();
    }
  };

  const handlePointerDown = (e) => {
    if (hasRevealedRef.current) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const point = getPoint(e);
    if (!point) return;

    isDrawingRef.current = true;
    lastPointRef.current = point;
    eraseStroke(null, point);
    evaluateScratchProgress();
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || hasRevealedRef.current) return;
    const point = getPoint(e);
    if (!point) return;

    eraseStroke(lastPointRef.current, point);
    lastPointRef.current = point;
    evaluateScratchProgress();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handlePlayAgain = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    hasRevealedRef.current = false;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    setGameResult(null);
    setIsUnveiling(false);
    setScratchPercentage(0);
    setSelectedTier(pickRandomTier());

    requestAnimationFrame(() => {
      drawFoilSurface();
    });
  };

  const progressWidth = Math.min(100, Math.round((scratchPercentage / REVEAL_THRESHOLD) * 100));

  return (
    <AtelierGameShell
      codeLabel="02 // FOIL PLATE"
      title="Silver Foil Plate"
      subtitle="Etch across the brushed titanium seal to unveil your archival privilege."
      onClose={() => onClose(gameCompleted)}
    >
      {gameResult ? (
        <AtelierRewardTicket
          code={gameResult.code}
          offerLabel={gameResult.offerLabel}
          gameName="Silver Foil Plate"
          metaNote="FOIL PLATE // AUTHENTICATED"
          allowReplay={allowReplay}
          onPlayAgain={handlePlayAgain}
          onClose={() => onClose(gameCompleted)}
        />
      ) : (
        <div className="space-y-6">
          {/* Plate Frame */}
          <div className="relative bg-[#121212] border border-white/[0.16] rounded-none overflow-hidden select-none">
            {/* Underlying Archival Plate */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(#F4F2ED 1px, transparent 1px), linear-gradient(90deg, #F4F2ED 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              <span className="font-mono-tech text-[9px] tracking-[0.34em] uppercase text-[#8E8B84] mb-2 relative z-10">
                MYSTIQUE ARCHIVE
              </span>
              <span className="font-display italic text-2xl sm:text-3xl text-[#F4F2ED] relative z-10">
                {isUnveiling ? "Decrypting Code..." : "Privilege Sealed"}
              </span>
              <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#8E8B84] mt-2 relative z-10">
                SINGLE-USE RELEASE PASS
              </span>
            </div>

            {/* Interactive Brushed Titanium Canvas */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="relative z-10 block w-full h-56 sm:h-60 cursor-crosshair touch-none"
            />
          </div>

          {/* 2px Monochrome Hairline Progress */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#8E8B84]">
              <span>
                {isUnveiling ? "UNVEILING PRIVILEGE" : "ETCH PROGRESS"}
              </span>
              <span className="text-[#F4F2ED]">
                {Math.min(100, Math.round(scratchPercentage))}%
              </span>
            </div>
            <div className="w-full h-[2px] bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#F4F2ED] transition-all duration-150 ease-out"
                style={{ width: `${isUnveiling ? 100 : progressWidth}%` }}
              />
            </div>
          </div>

          {/* Footer Guidance + Accessible Instant Reveal */}
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/[0.1]">
            <span className="font-body text-xs text-[#8E8B84]">
              {isUnveiling
                ? "Issuing personal archive code..."
                : "Drag across the brushed titanium surface to reveal."}
            </span>
            <button
              type="button"
              onClick={revealResult}
              disabled={isUnveiling}
              className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#F4F2ED]/75 hover:text-[#F4F2ED] underline underline-offset-4 transition-colors flex-shrink-0 disabled:opacity-40"
            >
              Instant Reveal
            </button>
          </div>
        </div>
      )}
    </AtelierGameShell>
  );
};

export default ScratchCardGame;
