"use client";

import React, { useEffect, useRef, useState } from "react";
import { client } from "@/sanity";
import { createGameDiscount } from "@/lib/promoOfferFactory";
import {
  AtelierGameShell,
  AtelierRewardTicket,
  AtelierVaultLocked,
} from "@/components/games/AtelierGameShell";

const MAX_MOVES = 8;

const EMBLEM_PAIRS = [
  { pair: 1, name: "MONOLITH" },
  { pair: 2, name: "PRISM" },
  { pair: 3, name: "COMPASS" },
  { pair: 4, name: "CHEVRON" },
];

function createShuffledDeck() {
  const deck = EMBLEM_PAIRS.flatMap((emblem) => [
    { pair: emblem.pair, name: emblem.name },
    { pair: emblem.pair, name: emblem.name },
  ]);

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck.map((item, idx) => ({
    id: idx + 1,
    plateCode: String(idx + 1).padStart(2, "0"),
    pair: item.pair,
    name: item.name,
  }));
}

function generateDiscountCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "MATCH";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function ArchitecturalEmblem({ pair }) {
  switch (pair) {
    case 1:
      // Monolith Rectangle
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-8 h-8 sm:w-9 sm:h-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="12" y="5" width="16" height="30" />
          <line x1="16" y1="11" x2="24" y2="11" />
          <line x1="20" y1="11" x2="20" y2="29" />
          <line x1="16" y1="29" x2="24" y2="29" />
        </svg>
      );
    case 2:
      // Diamond Prism
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-8 h-8 sm:w-9 sm:h-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polygon points="20,4 34,20 20,36 6,20" />
          <polygon points="20,12 27,20 20,28 13,20" />
          <line x1="20" y1="4" x2="20" y2="12" />
          <line x1="20" y1="28" x2="20" y2="36" />
        </svg>
      );
    case 3:
      // Crosshair Compass
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-8 h-8 sm:w-9 sm:h-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="20" cy="20" r="10" />
          <circle cx="20" cy="20" r="2.2" fill="currentColor" />
          <line x1="20" y1="4" x2="20" y2="13" />
          <line x1="20" y1="27" x2="20" y2="36" />
          <line x1="4" y1="20" x2="13" y2="20" />
          <line x1="27" y1="20" x2="36" y2="20" />
        </svg>
      );
    default:
      // Double Chevron
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-8 h-8 sm:w-9 sm:h-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <polyline points="8,18 20,7 32,18" />
          <polyline points="8,29 20,18 32,29" />
          <line x1="14" y1="33" x2="26" y2="33" />
        </svg>
      );
  }
}

const CardFlipGame = ({
  onClose,
  allowReplay = true,
  recordGamePlay = () => {},
}) => {
  const [cards, setCards] = useState(() => createShuffledDeck());
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const hasRecordedRoundRef = useRef(false);
  const isMountedRef = useRef(true);
  const timersRef = useRef([]);

  const scheduleTimeout = (fn, delay) => {
    const id = setTimeout(() => {
      if (isMountedRef.current) fn();
    }, delay);
    timersRef.current.push(id);
    return id;
  };

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearAllTimers();
    };
  }, []);

  const handleCardClick = async (card) => {
    if (isLocked || gameOver || gameResult) return;
    if (flippedIds.includes(card.id) || matchedPairs.has(card.pair)) return;

    if (!hasRecordedRoundRef.current) {
      hasRecordedRoundRef.current = true;
      setGameCompleted(true);
      recordGamePlay();
    }

    const nextFlipped = [...flippedIds, card.id];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length < 2) return;

    // Lock interactions immediately while resolving the pair
    setIsLocked(true);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    const firstCard = cards.find((c) => c.id === nextFlipped[0]);
    const secondCard = cards.find((c) => c.id === nextFlipped[1]);

    if (firstCard && secondCard && firstCard.pair === secondCard.pair) {
      const nextMatches = new Set(matchedPairs);
      nextMatches.add(firstCard.pair);
      setMatchedPairs(nextMatches);

      if (nextMatches.size === EMBLEM_PAIRS.length) {
        const newCode = generateDiscountCode();
        let offerLabel = "Private Archive Privilege";

        try {
          const offer = await createGameDiscount(client, {
            code: newCode,
            gameName: "Atelier Emblem Match",
            tier: nextMoves <= 5 ? "high" : "standard",
          });
          if (offer?.label) {
            offerLabel = offer.label;
          }
        } catch (error) {
          console.error("Error creating discount:", error);
        }

        scheduleTimeout(() => {
          setGameResult({
            code: newCode,
            offerLabel,
            moves: nextMoves,
          });
          setIsLocked(false);
        }, 420);
        return;
      }

      if (nextMoves >= MAX_MOVES) {
        scheduleTimeout(() => {
          setFlippedIds([]);
          setIsLocked(false);
          setGameOver(true);
        }, 700);
        return;
      }

      scheduleTimeout(() => {
        setFlippedIds([]);
        setIsLocked(false);
      }, 360);
    } else {
      scheduleTimeout(() => {
        setFlippedIds([]);
        setIsLocked(false);
        if (nextMoves >= MAX_MOVES) {
          setGameOver(true);
        }
      }, 850);
    }
  };

  const handlePlayAgain = () => {
    clearAllTimers();
    hasRecordedRoundRef.current = false;
    setCards(createShuffledDeck());
    setFlippedIds([]);
    setMatchedPairs(new Set());
    setMoves(0);
    setIsLocked(false);
    setGameResult(null);
    setGameOver(false);
  };

  const movesRemaining = Math.max(0, MAX_MOVES - moves);

  return (
    <AtelierGameShell
      codeLabel="04 // EMBLEM MATCH"
      title="Atelier Emblem Match"
      subtitle="Pair all four architectural marks within eight moves to unlock your code."
      onClose={() => onClose(gameCompleted)}
    >
      {gameResult ? (
        <AtelierRewardTicket
          code={gameResult.code}
          offerLabel={gameResult.offerLabel}
          gameName="Atelier Emblem Match"
          metaNote={`CLEARED IN ${gameResult.moves} OF ${MAX_MOVES} MOVES`}
          allowReplay={allowReplay}
          onPlayAgain={handlePlayAgain}
          onClose={() => onClose(gameCompleted)}
        />
      ) : gameOver ? (
        <AtelierVaultLocked
          title="Vault Sealed"
          message={`All ${MAX_MOVES} moves were exhausted before pairing every architectural emblem.`}
          detail={`MATCHED ${matchedPairs.size} OF 4 EMBLEMS`}
          allowReplay={allowReplay}
          onPlayAgain={handlePlayAgain}
          onClose={() => onClose(gameCompleted)}
        />
      ) : (
        <div className="space-y-6">
          {/* Telemetry HUD */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#8E8B84]">
              <span>
                MOVES{" "}
                <strong className="text-[#F4F2ED] font-medium">
                  {String(moves).padStart(2, "0")}/{String(MAX_MOVES).padStart(2, "0")}
                </strong>
              </span>
              <span>
                MATCHED{" "}
                <strong className="text-[#F4F2ED] font-medium">
                  {matchedPairs.size}/4
                </strong>
              </span>
            </div>
            <div className="w-full h-[2px] bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#F4F2ED] transition-all duration-300 ease-out"
                style={{ width: `${(movesRemaining / MAX_MOVES) * 100}%` }}
              />
            </div>
          </div>

          {/* 4x2 Cardstock Plate Grid */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            {cards.map((card) => {
              const isMatched = matchedPairs.has(card.pair);
              const isFlipped = flippedIds.includes(card.id) || isMatched;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card)}
                  disabled={isFlipped || isLocked}
                  aria-label={`Emblem plate ${card.plateCode}`}
                  className="group relative h-24 sm:h-28 w-full text-left focus:outline-none disabled:cursor-default"
                  style={{ perspective: "900px" }}
                >
                  <div
                    className="relative w-full h-full"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      transition: "transform 0.52s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Face-Down Engraved Monogram Plate */}
                    <div
                      className="absolute inset-0 bg-[#121212] border border-white/[0.14] group-hover:border-[#F4F2ED]/65 group-hover:bg-[#1A1A1A] transition-colors flex flex-col items-center justify-center overflow-hidden"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-[0.07]"
                        style={{
                          backgroundImage:
                            "linear-gradient(#F4F2ED 1px, transparent 1px), linear-gradient(90deg, #F4F2ED 1px, transparent 1px)",
                          backgroundSize: "12px 12px",
                        }}
                      />
                      <span className="pointer-events-none absolute top-1.5 left-1.5 font-mono-tech text-[8px] tracking-[0.18em] text-[#8E8B84]">
                        {card.plateCode}
                      </span>
                      <span className="relative z-10 font-display italic text-2xl text-[#F4F2ED]/80 group-hover:text-[#F4F2ED] transition-colors">
                        M
                      </span>
                    </div>

                    {/* Face-Up Bespoke Architectural Emblem */}
                    <div
                      className={`absolute inset-0 border flex flex-col items-center justify-center gap-1.5 px-1 ${
                        isMatched
                          ? "bg-[#F4F2ED] text-[#0A0A0A] border-[#F4F2ED]"
                          : "bg-[#1A1A1A] text-[#F4F2ED] border-[#F4F2ED]/80"
                      }`}
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <ArchitecturalEmblem pair={card.pair} />
                      <span
                        className={`font-mono-tech text-[7px] sm:text-[8px] tracking-[0.22em] uppercase ${
                          isMatched ? "text-[#0A0A0A]/70" : "text-[#8E8B84]"
                        }`}
                      >
                        {card.name}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="font-mono-tech text-[9px] tracking-[0.24em] uppercase text-[#8E8B84] text-center">
            {movesRemaining} {movesRemaining === 1 ? "MOVE" : "MOVES"} REMAINING IN VAULT CYCLE
          </p>
        </div>
      )}
    </AtelierGameShell>
  );
};

export default CardFlipGame;
