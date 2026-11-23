"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, Clock, Lock } from "lucide-react";
import { client } from "@/sanity";
import { useAuth } from "@/context/AuthContext";
import {
  getVaultPlayStatus,
  recordVaultPlay,
  getUnlockedReward,
  formatRemainingTime,
  isInviteDismissedThisSession,
  dismissInviteForSession,
  GAME_CATALOG,
} from "@/lib/promoVaultStorage";
import {
  AtelierGameShell,
  AtelierRewardTicket,
} from "./games/AtelierGameShell";
import MysteryBoxGame from "./games/MysteryBoxGame";
import ScratchCardGame from "./games/ScratchCardGame";
import LuckyWheelGame from "./games/LuckyWheelGame";
import CardFlipGame from "./games/CardFlipGame";
import NumberGuessGame from "./games/NumberGuessGame";
import NeonVaultGame from "./games/NeonVaultGame";

const DEFAULT_PROMO_GAMES = {
  enabled: true,
  activeGame: "mystery-box",
  offerCycleId: "default",
  replayInterval: 24,
  autoOpenDelay: 6,
};

const GAME_MAP = {
  "mystery-box": MysteryBoxGame,
  "scratch-card": ScratchCardGame,
  "lucky-wheel": LuckyWheelGame,
  "card-flip": CardFlipGame,
  "number-guess": NumberGuessGame,
  "neon-vault": NeonVaultGame,
};

const PromoGameSelector = ({ isOpen, onClose }) => {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [activeReward, setActiveReward] = useState(null);
  const [playTick, setPlayTick] = useState(0);

  const hasTriggeredInvite = useRef(false);
  const allowedThisSession = useRef(false);
  const recordedThisRound = useRef(false);

  // Sync unlocked reward state across tabs & game wins
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

  // Fetch Sanity promotional game configuration with graceful defaults
  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "siteSettings"][0] {
            promotionalGames {
              enabled,
              activeGame,
              offerCycleId,
              replayInterval,
              autoOpenDelay
            }
          }`
        );
        if (!mounted) return;
        const promo = data?.promotionalGames;
        if (promo) {
          setSettings({
            promotionalGames: {
              ...DEFAULT_PROMO_GAMES,
              ...promo,
              enabled: promo.enabled !== false,
              activeGame: promo.activeGame || DEFAULT_PROMO_GAMES.activeGame,
              replayInterval:
                promo.replayInterval ?? DEFAULT_PROMO_GAMES.replayInterval,
              autoOpenDelay:
                promo.autoOpenDelay ?? DEFAULT_PROMO_GAMES.autoOpenDelay,
            },
          });
        } else {
          setSettings({ promotionalGames: DEFAULT_PROMO_GAMES });
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
        if (mounted) {
          setSettings({ promotionalGames: DEFAULT_PROMO_GAMES });
        }
      } finally {
        if (mounted) setSettingsLoaded(true);
      }
    };

    fetchSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const showModal = Boolean(isOpen || internalIsOpen);

  // Hide the whisper-quiet invitation bar whenever the modal opens
  useEffect(() => {
    if (showModal) {
      setShowInvite(false);
    } else {
      allowedThisSession.current = false;
      recordedThisRound.current = false;
    }
  }, [showModal]);

  const promo = settings?.promotionalGames;
  const isEnabled = promo?.enabled !== false;
  const activeGameId = promo?.activeGame || "mystery-box";
  const activeGameMeta =
    GAME_CATALOG[activeGameId] || GAME_CATALOG["mystery-box"];

  // Compute current play status (re-evaluated whenever playTick, settings, or user changes)
  const playStatus = settingsLoaded
    ? getVaultPlayStatus({ user, settings })
    : { canPlay: false, remainingMs: 0, oneTimeUsed: false };

  // Non-blocking floating invitation bar after autoOpenDelay
  useEffect(() => {
    if (!settingsLoaded || authLoading || !isEnabled) return;
    if (hasTriggeredInvite.current) return;

    const delaySeconds = Number(promo?.autoOpenDelay ?? 6);
    if (delaySeconds <= 0) {
      hasTriggeredInvite.current = true;
      return;
    }

    if (
      showModal ||
      isInviteDismissedThisSession() ||
      !playStatus.canPlay ||
      activeReward
    ) {
      return;
    }

    const timer = setTimeout(() => {
      hasTriggeredInvite.current = true;
      if (
        !isInviteDismissedThisSession() &&
        !getUnlockedReward() &&
        getVaultPlayStatus({ user, settings }).canPlay
      ) {
        setShowInvite(true);
      }
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [
    settingsLoaded,
    authLoading,
    isEnabled,
    promo?.autoOpenDelay,
    showModal,
    playStatus.canPlay,
    activeReward,
    user,
    settings,
    playTick,
  ]);

  const handleRecordGamePlay = useCallback(() => {
    if (!activeGameId || recordedThisRound.current) return;
    recordedThisRound.current = true;
    recordVaultPlay({
      user,
      activeGame: activeGameId,
      offerCycleId: promo?.offerCycleId,
    });
    setPlayTick((t) => t + 1);
  }, [user, activeGameId, promo?.offerCycleId]);

  const handleCloseModal = useCallback(
    (gameWasPlayed = false) => {
      if (gameWasPlayed === true) {
        handleRecordGamePlay();
      }
      setInternalIsOpen(false);
      onClose?.();
    },
    [handleRecordGamePlay, onClose]
  );

  const handleDismissInvite = () => {
    dismissInviteForSession();
    setShowInvite(false);
  };

  const handleEnterFromInvite = () => {
    setShowInvite(false);
    setInternalIsOpen(true);
  };

  // Respect explicit admin disable
  if (!settingsLoaded || !isEnabled) return null;

  const GameComponent = GAME_MAP[activeGameId] || MysteryBoxGame;

  // Keep game mounted through completion animation if player started while eligible
  const actuallyCanPlay = allowedThisSession.current || playStatus.canPlay;
  if (showModal && actuallyCanPlay) {
    allowedThisSession.current = true;
  }

  return (
    <>
      {/* Non-Blocking Whisper-Quiet Floating Atelier Vault Invitation Bar */}
      <AnimatePresence>
        {showInvite && !showModal && (
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Atelier Vault Invitation"
            className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[60] w-[calc(100vw-2.5rem)] max-w-[345px] bg-[#0A0A0A] border border-white/[0.22] text-[#F4F2ED] shadow-[0_24px_65px_rgba(0,0,0,0.72)] rounded-none p-5"
          >
            {/* Corner Registration Marks */}
            <span className="pointer-events-none absolute top-2 left-2 w-2 h-2 border-t border-l border-[#F4F2ED]/35" />
            <span className="pointer-events-none absolute top-2 right-2 w-2 h-2 border-t border-r border-[#F4F2ED]/35" />
            <span className="pointer-events-none absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#F4F2ED]/35" />
            <span className="pointer-events-none absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#F4F2ED]/35" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono-tech text-[8.5px] tracking-[0.28em] uppercase text-[#8E8B84] block mb-1.5">
                  ATELIER VAULT // PRIVATE PRIVILEGE
                </span>
                <h3 className="font-display italic text-xl text-[#F4F2ED] leading-tight">
                  {activeGameMeta.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleDismissInvite}
                aria-label="Dismiss invitation"
                className="w-7 h-7 border border-white/[0.16] flex items-center justify-center text-[#8E8B84] hover:text-[#F4F2ED] hover:border-white/[0.4] transition-colors flex-shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="font-body text-xs text-[#8E8B84] leading-relaxed mt-2.5">
              Unlock an exclusive release code in {activeGameMeta.duration}. No
              account required.
            </p>

            <div className="mt-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleEnterFromInvite}
                className="group flex-1 inline-flex items-center justify-center gap-2 bg-[#F4F2ED] text-[#0A0A0A] hover:bg-white py-2.5 px-4 font-mono-tech text-[10px] font-semibold tracking-[0.22em] uppercase transition-colors cursor-pointer"
              >
                <span>Enter Vault</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={handleDismissInvite}
                className="py-2.5 px-3.5 border border-white/[0.16] text-[#8E8B84] hover:text-[#F4F2ED] hover:border-white/[0.35] font-mono-tech text-[9px] tracking-[0.2em] uppercase transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Active Game Modal OR Saved Reward / Cooldown Vault Status */}
      {showModal && (
        <>
          {actuallyCanPlay ? (
            <GameComponent
              onClose={handleCloseModal}
              allowReplay={false}
              recordGamePlay={handleRecordGamePlay}
            />
          ) : (
            <AtelierGameShell
              codeLabel="ATELIER VAULT // STATUS"
              title={
                activeReward ? "Your Archive Privilege" : "Vault Cooling Down"
              }
              subtitle={
                activeReward
                  ? "Your personal privilege code is saved and ready for checkout."
                  : "Archival privileges reset on a timed cadence to preserve small-batch allocations."
              }
              onClose={() => handleCloseModal(false)}
            >
              {activeReward ? (
                <AtelierRewardTicket
                  code={activeReward.code}
                  offerLabel={activeReward.offerLabel}
                  gameName={activeReward.gameName}
                  metaNote={
                    playStatus.oneTimeUsed
                      ? "ONE-TIME EDITION // PASS SAVED"
                      : playStatus.remainingMs > 0
                      ? `NEXT CHALLENGE IN ${formatRemainingTime(
                          playStatus.remainingMs
                        )}`
                      : "PASS ACTIVE"
                  }
                  allowReplay={false}
                  onClose={() => handleCloseModal(false)}
                />
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="w-12 h-12 mx-auto border border-white/[0.2] flex items-center justify-center text-[#F4F2ED]/80">
                    {playStatus.oneTimeUsed ? (
                      <Lock className="w-5 h-5 stroke-[1.5px]" />
                    ) : (
                      <Clock className="w-5 h-5 stroke-[1.5px]" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="font-mono-tech text-[10px] tracking-[0.28em] uppercase text-[#8E8B84]">
                      {activeGameMeta.name}
                    </p>
                    {playStatus.oneTimeUsed ? (
                      <p className="font-body text-sm text-[#F4F2ED]/80 max-w-sm mx-auto">
                        You have already claimed this limited-edition vault
                        challenge. Watch for the next archive cycle.
                      </p>
                    ) : (
                      <>
                        <p className="font-mono-tech text-3xl sm:text-4xl font-light tracking-[0.2em] text-[#F4F2ED] tabular-nums">
                          {formatRemainingTime(playStatus.remainingMs) || "Soon"}
                        </p>
                        <p className="font-body text-xs text-[#8E8B84] max-w-xs mx-auto">
                          Until the vault unseals for your next archival
                          challenge.
                        </p>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCloseModal(false)}
                    className="w-full py-3.5 bg-[#F4F2ED] text-[#0A0A0A] hover:bg-white font-mono-tech text-[10px] font-semibold tracking-[0.24em] uppercase transition-colors cursor-pointer"
                  >
                    Return To Archive
                  </button>
                </div>
              )}
            </AtelierGameShell>
          )}
        </>
      )}
    </>
  );
};

export default PromoGameSelector;
