"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center bg-[#F6F5F1] text-[#0D0D0D] px-4 py-14">
      <div className="w-full max-w-md bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10">
        <div className="text-center mb-7 pb-6 border-b border-[#0D0D0D]/10">
          <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block mb-2">
            Account Recovery
          </span>
          <h1 className="font-display italic text-3xl sm:text-4xl font-semibold text-[#0D0D0D]">
            Reset Password
          </h1>
          <p className="font-body text-xs text-[#64625C] mt-2 leading-relaxed">
            Enter your account email and we&apos;ll send a secure reset link.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-[#991B1B]/6 border border-[#991B1B]/25 rounded-[2px] text-[#991B1B] text-xs">
            {error}
          </div>
        )}

        {sent ? (
          <div className="p-6 rounded-[2px] bg-[#1A5D3A]/6 border border-[#1A5D3A]/25 text-center space-y-2.5">
            <CheckCircle2 className="w-7 h-7 text-[#1A5D3A] mx-auto" />
            <p className="font-body text-sm text-[#0D0D0D] font-semibold">
              Reset link dispatched
            </p>
            <p className="font-body text-xs text-[#64625C] leading-relaxed">
              Check your inbox at <span className="text-[#0D0D0D] font-medium">{email}</span> for password recovery instructions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@domain.com"
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D0D0D] text-[#F6F5F1] py-3.5 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-[#262626] disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending Link..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="mt-7 pt-5 border-t border-[#0D0D0D]/10 text-center">
          <Link
            href="/account/login"
            className="inline-flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] hover:text-[#0D0D0D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back To Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
