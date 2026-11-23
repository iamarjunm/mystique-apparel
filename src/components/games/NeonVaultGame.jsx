"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { client } from "@/sanity";
import {
  AtelierGameShell,
  AtelierRewardTicket,
  AtelierVaultLocked,
} from "@/components/games/AtelierGameShell";

const PAD_CONFIG = [
  { id: 0, numeral: "I", indexLabel: "01", freq: 220.0 },
  { id: 1, numeral: "II", indexLabel: "02", freq: 261.63 },
  { id: 2, numeral: "III", indexLabel: "03", freq: 293.66 },
  { id: 3, numeral: "IV", indexLabel: "04", freq: 329.63 },
  { id: 4, numeral: "V", indexLabel: "05", freq: 392.0 },
  { id: 5, numeral: "VI", indexLabel: "06", freq: 440.0 },
];

const ROUNDS_TO_WIN = 8;
const MAX_ERRORS = 4;
const BASE_SPEED = 520;
const MIN_SPEED = 270;

function generateDiscountCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "VAULT";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getSpeedForRound(currentRound) {
  const progress = (currentRound - 1) / (ROUNDS_TO_WIN - 1);
  return Math.max(MIN_SPEED, Math.round(BASE_SPEED - progress * (BASE_SPEED - MIN_SPEED)));
}

const NeonVaultGame = ({
  onClose,
  allowReplay = true,
  recordGamePlay = () => {},
}) => {
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [round, setRound] = useState(1);
  const [errors, setErrors] = useState(0);
  const [showingSequence, setShowingSequence] = useState(true);
  const [activePad, setActivePad] = useState(null);
  const [errorFlash, setErrorFlash] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [gameResult, setGameResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const isMountedRef = useRef(true);
  const runIdRef = useRef(0);
  const timersRef = useRef([]);
  const audioCtxRef = useRef(null);
  const audioEnabledRef = useRef(true);
  const hasRecordedRoundRef = useRef(false);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const wait = useCallback((ms, runId) => {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        resolve(isMountedRef.current && runIdRef.current === runId);
      }, ms);
      timersRef.current.push(id);
    });
  }, []);

  const playTone = useCallback((freq, durationMs = 210) => {
    if (!audioEnabledRef.current || typeof window === "undefined") return;
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationMs / 1000 + 0.02);
    } catch {
      // Audio playback blocked or unavailable; fail silently
    }
  }, []);

  const playSequence = useCallback(
    async (seq, currentRound, runId) => {
      if (!isMountedRef.current || runIdRef.current !== runId) return;
      setShowingSequence(true);
      setActivePad(null);

      const speed = getSpeedForRound(currentRound);
      if (!(await wait(520, runId))) return;

      for (const step of seq) {
        if (!isMountedRef.current || runIdRef.current !== runId) return;
        setActivePad(step);
        playTone(PAD_CONFIG[step]?.freq || 261.63, Math.min(speed, 260));

        if (!(await wait(speed, runId))) return;
        setActivePad(null);
        if (!(await wait(Math.round(speed * 0.36), runId))) return;
      }

      if (!isMountedRef.current || runIdRef.current !== runId) return;
      setShowingSequence(false);
    },
    [playTone, wait]
  );

  const startGame = useCallback(() => {
    clearAllTimers();
    const nextRunId = runIdRef.current + 1;
    runIdRef.current = nextRunId;
    hasRecordedRoundRef.current = false;

    const first = Math.floor(Math.random() * PAD_CONFIG.length);
    const initialSequence = [first];

    setSequence(initialSequence);
    setPlayerInput([]);
    setRound(1);
    setErrors(0);
    setErrorFlash(false);
    setGameOver(false);
    setGameResult(null);
    setActivePad(null);
    setShowingSequence(true);

    playSequence(initialSequence, 1, nextRunId);
  }, [clearAllTimers, playSequence]);

  useEffect(() => {
    isMountedRef.current = true;
    startGame();
    return () => {
      isMountedRef.current = false;
      runIdRef.current += 1;
      clearAllTimers();
      try {
        audioCtxRef.current?.close?.();
      } catch {
        // Ignore audio teardown errors
      }
    };
  }, [clearAllTimers, startGame]);

  const createReward = async (reward, newCode) => {
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await client.create({
      _type: "discountCode",
      code: newCode,
      description: `Obsidian Sequence Vault reward: ${reward}% off`,
      discountType: "percentage",
      percentageOff: reward,
      appliesTo: "entireOrder",
      usageLimit: 1,
      usageLimitPerCustomer: 1,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      isActive: true,
      timesUsed: 0,
    });
  };

  const handlePadClick = async (padId) => {
    if (showingSequence || gameResult || gameOver) return;
    const currentRunId = runIdRef.current;

    if (!hasRecordedRoundRef.current) {
      hasRecordedRoundRef.current = true;
      setGameCompleted(true);
      recordGamePlay();
    }

    setActivePad(padId);
    playTone(PAD_CONFIG[padId]?.freq || 261.63, 170);

    const nextInput = [...playerInput, padId];
    const expected = sequence[nextInput.length - 1];

    if (padId !== expected) {
      setShowingSequence(true);
      setErrorFlash(true);
      const nextErrors = errors + 1;
      setErrors(nextErrors);
      setPlayerInput([]);

      if (!(await wait(240, currentRunId))) return;
      setActivePad(null);
      setErrorFlash(false);

      if (nextErrors >= MAX_ERRORS) {
        setGameOver(true);
        return;
      }

      if (!(await wait(340, currentRunId))) return;
      await playSequence(sequence, round, currentRunId);
      return;
    }

    setPlayerInput(nextInput);

    if (!(await wait(160, currentRunId))) return;
    setActivePad(null);

    if (nextInput.length === sequence.length) {
      setShowingSequence(true);

      if (round >= ROUNDS_TO_WIN) {
        const reward =
          errors === 0 ? 12 : errors === 1 ? 10 : errors === 2 ? 9 : 7;
        const newCode = generateDiscountCode();

        try {
          await createReward(reward, newCode);
        } catch (error) {
          console.error("Error creating discount:", error);
        }

        if (!isMountedRef.current || runIdRef.current !== currentRunId) return;
        setGameResult({
          reward,
          code: newCode,
          errors,
        });
        return;
      }

      const nextRound = round + 1;
      const extended = [
        ...sequence,
        Math.floor(Math.random() * PAD_CONFIG.length),
      ];
      setRound(nextRound);
      setSequence(extended);
      setPlayerInput([]);

      if (!(await wait(440, currentRunId))) return;
      await playSequence(extended, nextRound, currentRunId);
    }
  };

  const progress = Math.round((round / ROUNDS_TO_WIN) * 100);
  const tempoLabel =
    round <= 3 ? "STANDARD" : round <= 5 ? "ACCELERATED" : "PRECISION";

  return (
    <AtelierGameShell
      codeLabel="06 // SEQUENCE VAULT"
      title="Obsidian Sequence Vault"
      subtitle="Mirror the harmonic sequence across six brushed-metal pads to unlock up to 12% off."
      maxWidth="max-w-xl"
      onClose={() => onClose(gameCompleted)}
    >
      {gameResult ? (
        <AtelierRewardTicket
          code={gameResult.code}
          offerLabel={`${gameResult.reward}% OFF Entire Order`}
          gameName="Obsidian Sequence Vault"
          metaNote={
            gameResult.errors === 0
              ? "PERFECT HARMONIC RUN // 0 ERRORS"
              : `CLEARED WITH ${gameResult.errors} ${
                  gameResult.errors === 1 ? "ERROR" : "ERRORS"
                }`
          }
          allowReplay={allowReplay}
          onPlayAgain={startGame}
          onClose={() => onClose(gameCompleted)}
        />
      ) : gameOver ? (
        <AtelierVaultLocked
          title="Sequence Lockout"
          message={`Maximum error threshold (${MAX_ERRORS}) was reached during vault calibration.`}
          detail={`REACHED ROUND ${round} OF ${ROUNDS_TO_WIN}`}
          allowReplay={allowReplay}
          onPlayAgain={startGame}
          onClose={() => onClose(gameCompleted)}
        />
      ) : (
        <div className="space-y-6">
          {/* Telemetry & 2px Hairline Progress */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#8E8B84]">
              <div className="flex items-center gap-3">
                <span>
                  ROUND{" "}
                  <strong className="text-[#F4F2ED] font-medium">
                    {round}/{ROUNDS_TO_WIN}
                  </strong>
                </span>
                <span className="text-white/20">•</span>
                <span>
                  ERRORS{" "}
                  <strong className="text-[#F4F2ED] font-medium">
                    {errors}/{MAX_ERRORS}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span>TEMPO: {tempoLabel}</span>
                <button
                  type="button"
                  onClick={() => setAudioEnabled((prev) => !prev)}
                  aria-label={audioEnabled ? "Mute sequence chimes" : "Unmute sequence chimes"}
                  className="inline-flex items-center gap-1.5 border border-white/[0.16] px-2 py-1 text-[9px] text-[#F4F2ED]/80 hover:border-[#F4F2ED] hover:text-[#F4F2ED] transition-colors"
                >
                  {audioEnabled ? (
                    <Volume2 className="w-3 h-3" />
                  ) : (
                    <VolumeX className="w-3 h-3" />
                  )}
                  <span>{audioEnabled ? "TONE" : "MUTE"}</span>
                </button>
              </div>
            </div>

            <div className="w-full h-[2px] bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#F4F2ED] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 6 Brushed-Metal Pads (I - VI) */}
          <div
            className={`grid grid-cols-3 gap-3 transition-opacity duration-200 ${
              errorFlash ? "opacity-60" : "opacity-100"
            }`}
          >
            {PAD_CONFIG.map((pad) => {
              const isActive = activePad === pad.id;
              return (
                <button
                  key={pad.id}
                  type="button"
                  onClick={() => handlePadClick(pad.id)}
                  disabled={showingSequence}
                  className={`group relative h-24 sm:h-28 rounded-none border transition-all duration-150 flex flex-col items-center justify-center overflow-hidden ${
                    isActive
                      ? "bg-[#F4F2ED] text-[#0A0A0A] border-[#F4F2ED]"
                      : "bg-[#121212] text-[#F4F2ED] border-white/[0.14] hover:bg-[#1A1A1A] hover:border-[#F4F2ED]/65"
                  } ${showingSequence && !isActive ? "cursor-wait" : ""}`}
                >
                  {/* Brushed Metal Subtle Hairline Grid */}
                  <div
                    className={`pointer-events-none absolute inset-0 ${
                      isActive ? "opacity-[0.08]" : "opacity-[0.05]"
                    }`}
                    style={{
                      backgroundImage: isActive
                        ? "linear-gradient(#0A0A0A 1px, transparent 1px), linear-gradient(90deg, #0A0A0A 1px, transparent 1px)"
                        : "linear-gradient(#F4F2ED 1px, transparent 1px), linear-gradient(90deg, #F4F2ED 1px, transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                  />

                  {/* Corner Crosshair Accents */}
                  <span
                    className={`pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t border-l ${
                      isActive ? "border-[#0A0A0A]/45" : "border-white/[0.2]"
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r ${
                      isActive ? "border-[#0A0A0A]/45" : "border-white/[0.2]"
                    }`}
                  />

                  <span
                    className={`pointer-events-none absolute top-1.5 right-2 font-mono-tech text-[8px] tracking-[0.2em] ${
                      isActive ? "text-[#0A0A0A]/60" : "text-[#8E8B84]"
                    }`}
                  >
                    {pad.indexLabel}
                  </span>

                  <span className="relative z-10 font-display text-2xl sm:text-3xl tracking-[0.08em]">
                    {pad.numeral}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Phase Status & Sequence Step Bars */}
          <div className="space-y-3 pt-1 text-center">
            <p className="font-mono-tech text-[10px] tracking-[0.28em] uppercase text-[#F4F2ED]">
              {errorFlash
                ? "MISALIGNMENT DETECTED // REPLAYING SEQUENCE"
                : showingSequence
                  ? "OBSERVE HARMONIC SEQUENCE"
                  : "REPEAT SEQUENCE NOW"}
            </p>

            <div className="flex items-center justify-center gap-1.5">
              {Array.from({ length: sequence.length }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-[3px] w-5 transition-colors duration-200 ${
                    idx < playerInput.length
                      ? "bg-[#F4F2ED]"
                      : "bg-white/[0.16]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </AtelierGameShell>
  );
};

export default NeonVaultGame;
