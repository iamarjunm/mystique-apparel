"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, Copy, Check, ArrowRight, RotateCcw, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { saveUnlockedReward } from "@/lib/promoVaultStorage";

/**
 * Shared architectural Noir Atelier modal wrapper for all promotional games.
 */
export function AtelierGameShell({
  codeLabel = "ATELIER VAULT",
  title,
  subtitle,
  onClose,
  maxWidth = "max-w-lg",
  children,
}) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-[4px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.985 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-[#0A0A0A] text-[#F4F2ED] border border-white/[0.16] rounded-none shadow-[0_32px_90px_rgba(0,0,0,0.8)] max-h-[92vh] overflow-y-auto`}
      >
        {/* Corner Registration Marks */}
        <span className="pointer-events-none absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-[#F4F2ED]/35" />
        <span className="pointer-events-none absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-[#F4F2ED]/35" />
        <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-[#F4F2ED]/35" />
        <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-[#F4F2ED]/35" />

        {/* Header Bar */}
        <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-white/[0.1] flex items-start justify-between gap-4">
          <div>
            <span className="font-mono-tech text-[9px] tracking-[0.34em] uppercase text-[#8E8B84] block mb-1.5">
              {codeLabel}
            </span>
            <h2 className="font-display italic text-2xl sm:text-3xl font-normal text-[#F4F2ED] leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="font-body text-xs text-[#8E8B84] mt-1.5 leading-relaxed max-w-md">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close vault challenge"
            className="w-9 h-9 border border-white/[0.16] flex items-center justify-center text-[#F4F2ED]/75 hover:bg-[#F4F2ED] hover:text-[#0A0A0A] hover:border-[#F4F2ED] transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">{children}</div>
      </motion.div>
    </div>
  );
}

/**
 * Tactile archival privilege ticket shown whenever a visitor wins any game.
 * Automatically persists the code so checkout can pre-fill it seamlessly.
 */
export function AtelierRewardTicket({
  code,
  offerLabel,
  gameName,
  metaNote,
  allowReplay = false,
  onPlayAgain,
  onClose,
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      saveUnlockedReward({ code, offerLabel, gameName });
    }
  }, [code, offerLabel, gameName]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Archive code ${code} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info(`Code: ${code}`);
    }
  };

  const handleApplyAndShop = () => {
    saveUnlockedReward({ code, offerLabel, gameName });
    toast.success(`Code ${code} saved for checkout`);
    onClose?.();
    router.push("/shop");
  };

  return (
    <div className="space-y-6">
      {/* Archival Metallic Ticket */}
      <div className="relative bg-[#121212] border border-white/[0.18] p-6 sm:p-7 text-center space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.1] pb-3 font-mono-tech text-[9px] tracking-[0.28em] uppercase text-[#8E8B84]">
          <span>PRIVILEGE UNLOCKED</span>
          <span>VALID 7 DAYS</span>
        </div>

        <div className="py-2 space-y-2">
          <p className="font-display italic text-2xl sm:text-3xl text-[#F4F2ED]">
            {offerLabel || "Private Archive Offer"}
          </p>
          {metaNote && (
            <p className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#8E8B84]">
              {metaNote}
            </p>
          )}
        </div>

        <div className="bg-[#0A0A0A] border border-dashed border-white/[0.28] py-4 px-4">
          <span className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#8E8B84] block mb-1.5">
            Personal Archive Code
          </span>
          <code className="font-mono-tech text-2xl sm:text-3xl font-semibold tracking-[0.26em] text-[#F4F2ED] break-all">
            {code}
          </code>
        </div>

        <p className="font-body text-[11px] text-[#8E8B84]">
          Automatically saved to your bag — ready to apply at checkout.
        </p>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-3.5 px-5 border border-white/[0.22] text-[#F4F2ED] hover:border-[#F4F2ED] font-mono-tech text-[10px] font-semibold tracking-[0.22em] uppercase flex items-center justify-center gap-2 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Code"}</span>
        </button>

        <button
          type="button"
          onClick={handleApplyAndShop}
          className="w-full py-3.5 px-5 bg-[#F4F2ED] text-[#0A0A0A] hover:bg-white font-mono-tech text-[10px] font-semibold tracking-[0.22em] uppercase flex items-center justify-center gap-2 transition-colors"
        >
          <span>Shop &amp; Auto-Apply</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {allowReplay && onPlayAgain && (
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full py-3 border border-white/[0.12] text-[#8E8B84] hover:text-[#F4F2ED] hover:border-white/[0.25] font-mono-tech text-[10px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Play Another Round</span>
        </button>
      )}
    </div>
  );
}

/**
 * Minimalist failure / vault-locked state for skill games.
 */
export function AtelierVaultLocked({
  title = "Vault Sealed",
  message,
  detail,
  allowReplay = false,
  onPlayAgain,
  onClose,
}) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-12 h-12 mx-auto border border-white/[0.2] flex items-center justify-center text-[#F4F2ED]/70">
        <Lock className="w-5 h-5 stroke-[1.5px]" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display italic text-3xl text-[#F4F2ED]">{title}</h3>
        <p className="font-body text-sm text-[#8E8B84] max-w-sm mx-auto">{message}</p>
        {detail && (
          <p className="font-mono-tech text-[11px] tracking-[0.2em] uppercase text-[#F4F2ED]/80 pt-1">
            {detail}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {allowReplay && onPlayAgain && (
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 py-3.5 bg-[#F4F2ED] text-[#0A0A0A] hover:bg-white font-mono-tech text-[10px] font-semibold tracking-[0.24em] uppercase transition-colors"
          >
            Try Again
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3.5 border border-white/[0.2] text-[#F4F2ED] hover:border-[#F4F2ED] font-mono-tech text-[10px] tracking-[0.24em] uppercase transition-colors"
        >
          Return To Archive
        </button>
      </div>
    </div>
  );
}
