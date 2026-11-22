"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);

    try {
      await new Promise((res) => setTimeout(res, 500));
      setJoined(true);
      setEmail("");
      toast.success("Welcome to The Private List. Enjoy early drop access.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText("VOID20").then(() => {
      setCopied(true);
      toast.info("Code VOID20 copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="relative bg-[#F6F5F1] text-[#0D0D0D] border-t border-[#0D0D0D]/[0.12] py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="max-w-[1380px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block">
              06 // The Private List
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-[#0D0D0D]">
              Enter The <span className="italic font-normal">Inner Circle</span>
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#64625C] leading-relaxed max-w-md">
              Receive 24-hour early access to numbered drops, private archive sales, and members-only atelier editions.
            </p>
          </div>

          {/* Right Form / Confirmation */}
          <div className="lg:col-span-6">
            {joined ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[#FFFFFF] border border-[#0D0D0D]/[0.15] rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#0D0D0D] font-mono-tech text-xs font-semibold uppercase tracking-[0.16em]">
                    <Check className="w-4 h-4" />
                    <span>Confirmed on The Private List</span>
                  </div>
                  <p className="font-body text-xs text-[#64625C]">
                    Apply your welcome privilege at checkout:
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-none bg-[#0D0D0D] text-[#F4F2ED] border border-[#0D0D0D] hover:bg-transparent hover:text-[#0D0D0D] font-mono-tech text-xs font-semibold tracking-[0.22em] uppercase transition-colors flex-shrink-0"
                >
                  <span>VOID20</span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="input-atelier flex-1 px-5 py-4 rounded-none text-xs sm:text-sm font-body"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#0D0D0D] text-[#F4F2ED] px-7 sm:px-9 py-4 rounded-none border border-[#0D0D0D] hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 font-mono-tech font-semibold uppercase tracking-[0.22em] text-[11px] disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-[#F4F2ED]/30 border-t-[#F4F2ED] rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Join List</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                <p className="font-mono-tech text-[9px] text-[#64625C] tracking-[0.22em] uppercase">
                  Zero Noise • Drop Alerts Only • Unsubscribe Anytime
                </p>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
