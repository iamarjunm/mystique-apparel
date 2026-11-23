"use client";

import React, { useRef, useState } from "react";
import { client } from "@/sanity";
import { createGameDiscount } from "@/lib/promoOfferFactory";
import {
  AtelierGameShell,
  AtelierRewardTicket,
  AtelierVaultLocked,
} from "@/components/games/AtelierGameShell";

const MAX_ATTEMPTS = 7;

function createSecretCombination() {
  return Math.floor(Math.random() * 100) + 1;
}

function generateDiscountCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "GUESS";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function formatTwoDigits(num) {
  return String(num).padStart(2, "0");
}

const NumberGuessGame = ({
  onClose,
  allowReplay = true,
  recordGamePlay = () => {},
}) => {
  const [secretNumber, setSecretNumber] = useState(() => createSecretCombination());
  const [guesses, setGuesses] = useState([]);
  const [minBound, setMinBound] = useState(1);
  const [maxBound, setMaxBound] = useState(100);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("ENTER COMBINATION // 01 – 100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const hasRecordedRoundRef = useRef(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isSubmitting || gameOver || gameResult) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
      setFeedback("INVALID ENTRY // USE 01 – 100");
      return;
    }

    if (!hasRecordedRoundRef.current) {
      hasRecordedRoundRef.current = true;
      setGameCompleted(true);
      recordGamePlay();
    }

    const direction =
      parsed === secretNumber ? "MATCH" : parsed < secretNumber ? "UP" : "DOWN";
    const nextGuesses = [...guesses, { value: parsed, direction }];
    setGuesses(nextGuesses);
    setInput("");

    if (parsed === secretNumber) {
      setIsSubmitting(true);
      setFeedback(`MATCH CONFIRMED // ${formatTwoDigits(parsed)}`);

      const newCode = generateDiscountCode();
      const tier =
        nextGuesses.length <= 3
          ? "high"
          : nextGuesses.length <= 5
            ? "standard"
            : "low";
      let offerLabel = "Private Archive Privilege";

      try {
        const offer = await createGameDiscount(client, {
          code: newCode,
          gameName: "The Cipher Lock",
          tier,
        });
        if (offer?.label) {
          offerLabel = offer.label;
        }
      } catch (error) {
        console.error("Error creating discount:", error);
      }

      setGameResult({
        code: newCode,
        offerLabel,
        attempts: nextGuesses.length,
        combination: secretNumber,
      });
      setIsSubmitting(false);
      return;
    }

    if (parsed < secretNumber) {
      setMinBound((prev) => Math.max(prev, Math.min(100, parsed + 1)));
      setFeedback(`↑ HIGHER — ABOVE ${formatTwoDigits(parsed)}`);
    } else {
      setMaxBound((prev) => Math.min(prev, Math.max(1, parsed - 1)));
      setFeedback(`↓ LOWER — BELOW ${formatTwoDigits(parsed)}`);
    }

    if (nextGuesses.length >= MAX_ATTEMPTS) {
      setGameOver(true);
    }
  };

  const handlePlayAgain = () => {
    hasRecordedRoundRef.current = false;
    setSecretNumber(createSecretCombination());
    setGuesses([]);
    setMinBound(1);
    setMaxBound(100);
    setInput("");
    setFeedback("ENTER COMBINATION // 01 – 100");
    setIsSubmitting(false);
    setGameResult(null);
    setGameOver(false);
  };

  const leftPct = ((minBound - 1) / 99) * 100;
  const rightPct = ((maxBound - 1) / 99) * 100;
  const spanWidth = Math.max(2, rightPct - leftPct);
  const midPct = leftPct + spanWidth / 2;

  return (
    <AtelierGameShell
      codeLabel="05 // CIPHER LOCK"
      title="The Cipher Lock"
      subtitle="Decode the vault combination between 01 and 100 in seven attempts."
      onClose={() => onClose(gameCompleted)}
    >
      {gameResult ? (
        <AtelierRewardTicket
          code={gameResult.code}
          offerLabel={gameResult.offerLabel}
          gameName="The Cipher Lock"
          metaNote={`COMBINATION ${formatTwoDigits(gameResult.combination)} // ${gameResult.attempts} ${
            gameResult.attempts === 1 ? "ATTEMPT" : "ATTEMPTS"
          }`}
          allowReplay={allowReplay}
          onPlayAgain={handlePlayAgain}
          onClose={() => onClose(gameCompleted)}
        />
      ) : gameOver ? (
        <AtelierVaultLocked
          title="Cipher Locked"
          message={`All ${MAX_ATTEMPTS} decryption attempts were exhausted before unlocking the vault.`}
          detail={`VAULT COMBINATION WAS ${formatTwoDigits(secretNumber)}`}
          allowReplay={allowReplay}
          onPlayAgain={handlePlayAgain}
          onClose={() => onClose(gameCompleted)}
        />
      ) : (
        <div className="space-y-6">
          {/* Narrowing Range Telemetry Panel */}
          <div className="bg-[#121212] border border-white/[0.14] p-5 space-y-5">
            <div className="flex items-center justify-between font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#8E8B84]">
              <span>ACTIVE RANGE</span>
              <span>
                ATTEMPTS{" "}
                <strong className="text-[#F4F2ED] font-medium">
                  {guesses.length}/{MAX_ATTEMPTS}
                </strong>
              </span>
            </div>

            {/* Live [ minBound ──●── maxBound ] Meter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono-tech text-xs tracking-[0.22em] text-[#F4F2ED]">
                <span>[ {formatTwoDigits(minBound)}</span>
                <span className="text-[10px] text-[#8E8B84] tracking-[0.26em]">
                  LIVE WINDOW
                </span>
                <span>{formatTwoDigits(maxBound)} ]</span>
              </div>

              <div className="relative h-5 flex items-center">
                {/* Full Track */}
                <div className="w-full h-[2px] bg-white/[0.12]" />
                {/* Active Narrowed Span */}
                <div
                  className="absolute h-[2px] bg-[#F4F2ED] transition-all duration-300 ease-out"
                  style={{
                    left: `${leftPct}%`,
                    width: `${spanWidth}%`,
                  }}
                />
                {/* Left Bracket Tick */}
                <span
                  className="absolute w-px h-3 bg-[#F4F2ED] transition-all duration-300 ease-out"
                  style={{ left: `${leftPct}%` }}
                />
                {/* Right Bracket Tick */}
                <span
                  className="absolute w-px h-3 bg-[#F4F2ED] transition-all duration-300 ease-out"
                  style={{ left: `${Math.min(100, rightPct)}%` }}
                />
                {/* Center Reticle Dot */}
                <span
                  className="absolute w-2 h-2 -ml-1 bg-[#F4F2ED] border border-[#0A0A0A] transition-all duration-300 ease-out"
                  style={{ left: `${Math.min(99, Math.max(1, midPct))}%` }}
                />
              </div>
            </div>

            {/* Crisp Directional Monospace Feedback */}
            <div className="border-t border-white/[0.1] pt-3.5 text-center">
              <p className="font-mono-tech text-xs tracking-[0.26em] uppercase text-[#F4F2ED]">
                {feedback}
              </p>
            </div>
          </div>

          {/* 7 Monochrome Attempt Chips */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, idx) => {
              const entry = guesses[idx];
              return (
                <div
                  key={idx}
                  className={`h-12 border flex flex-col items-center justify-center font-mono-tech transition-colors ${
                    entry
                      ? "bg-[#1A1A1A] border-white/[0.28] text-[#F4F2ED]"
                      : "bg-[#0A0A0A] border-white/[0.1] text-[#8E8B84]/40"
                  }`}
                >
                  {entry ? (
                    <>
                      <span className="text-xs font-semibold leading-none">
                        {formatTwoDigits(entry.value)}
                      </span>
                      <span className="text-[9px] text-[#8E8B84] mt-1 leading-none">
                        {entry.direction === "UP"
                          ? "↑"
                          : entry.direction === "DOWN"
                            ? "↓"
                            : "="}
                      </span>
                    </>
                  ) : (
                    <span className="text-[9px] tracking-[0.15em]">
                      0{idx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input + DECODE CTA */}
          <form onSubmit={handleSubmit} className="flex gap-2.5">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${formatTwoDigits(minBound)} – ${formatTwoDigits(maxBound)}`}
              disabled={isSubmitting || guesses.length >= MAX_ATTEMPTS}
              className="input-noir flex-1 px-4 py-3.5 rounded-none font-mono-tech text-base tracking-[0.22em] text-center"
              aria-label="Enter vault combination between 1 and 100"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSubmitting || guesses.length >= MAX_ATTEMPTS}
              className="px-6 sm:px-8 py-3.5 bg-[#F4F2ED] text-[#0A0A0A] hover:bg-white disabled:bg-[#1A1A1A] disabled:text-[#8E8B84] disabled:border disabled:border-white/[0.14] disabled:cursor-not-allowed font-mono-tech text-[11px] font-semibold tracking-[0.26em] uppercase transition-colors rounded-none"
            >
              {isSubmitting ? "..." : "DECODE"}
            </button>
          </form>
        </div>
      )}
    </AtelierGameShell>
  );
};

export default NumberGuessGame;
