"use client";

import { useEffect } from "react";

/**
 * Google Sign-In Loading Modal
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 */
export function GoogleSignInModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0A0A0A]/65 flex items-center justify-center z-50 px-4">
      <div className="bg-white border border-[#0D0D0D]/15 rounded-[2px] p-8 sm:p-10 max-w-sm w-full text-center">
        <div className="flex flex-col items-center gap-6">
          {/* Minimalist Monochrome Spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border border-[#0D0D0D]/15" />
            <div className="absolute inset-0 rounded-full border-t border-[#0D0D0D] animate-spin" />
          </div>

          <div>
            <span className="font-mono-tech text-[10px] tracking-[0.3em] uppercase text-[#64625C] block mb-1.5">
              Google Authentication
            </span>
            <h3 className="font-display italic text-2xl text-[#0D0D0D]">
              Authenticating
            </h3>
            <p className="font-body text-xs text-[#64625C] mt-2 leading-relaxed">
              Complete sign-in in the Google popup window...
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-1 px-6 py-2.5 font-mono-tech text-[10px] uppercase tracking-[0.22em] text-[#0D0D0D] border border-[#0D0D0D]/25 hover:border-[#0D0D0D] rounded-[2px] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
