"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GoogleSignInModal } from "@/components/GoogleSignInModal";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.displayName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      setError("Sign-up timed out. Please try again.");
      setLoading(false);
    }, 15000);

    try {
      await signUp(formData.email, formData.password, formData.displayName);
      clearTimeout(timeout);
      router.push("/account");
    } catch (err) {
      clearTimeout(timeout);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError(err.message || "Failed to create account.");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    setShowGoogleModal(true);

    const timeout = setTimeout(() => {
      setError("Google sign-up timed out. Please allow popups and try again.");
      setShowGoogleModal(false);
      setLoading(false);
    }, 30000);

    try {
      await signInWithGoogle();
      clearTimeout(timeout);
      setShowGoogleModal(false);
      router.push("/account");
    } catch (err) {
      clearTimeout(timeout);
      setError(err.message || "Failed to sign up with Google.");
      setShowGoogleModal(false);
      setLoading(false);
    }
  };

  return (
    <>
      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />

      <div className="min-h-[85vh] flex items-center justify-center bg-[#F6F5F1] text-[#0D0D0D] px-4 py-14">
        <div className="w-full max-w-md bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10">
          <div className="text-center mb-8 pb-6 border-b border-[#0D0D0D]/10">
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block mb-2">
              Join The Inner Circle
            </span>
            <h1 className="font-display italic text-4xl font-semibold text-[#0D0D0D]">
              Create Account
            </h1>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-[#991B1B]/6 border border-[#991B1B]/25 rounded-[2px] text-[#991B1B] text-xs">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={showGoogleModal || loading}
            className="w-full mb-6 px-4 py-3.5 bg-[#F6F5F1] border border-[#0D0D0D]/20 rounded-[2px] font-body text-xs font-medium text-[#0D0D0D] hover:border-[#0D0D0D] hover:bg-[#EAE8E2] disabled:opacity-50 flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{showGoogleModal ? "Opening Google..." : "Sign up with Google"}</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#0D0D0D]/12" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white font-mono-tech text-[9px] tracking-[0.25em] uppercase text-[#64625C]">
                Or with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
                placeholder="you@domain.com"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D0D0D] text-[#F6F5F1] py-3.5 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-[#262626] disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-[#64625C]">
            Already have an account?{" "}
            <Link
              href="/account/login"
              className="text-[#0D0D0D] font-medium underline underline-offset-4 hover:opacity-75 transition-opacity"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
