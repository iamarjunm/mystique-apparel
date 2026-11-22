"use client";

import React, { useState } from "react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { Lock } from "lucide-react";

const PasswordSection = ({ user }) => {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSavePassword = async () => {
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!user) {
      setError("No user logged in.");
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setIsEditingPassword(false);
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("[PASSWORD] Error:", error);
      if (error.code === "auth/wrong-password") {
        setError("Current password is incorrect.");
      } else if (error.code === "auth/requires-recent-login") {
        setError("Please sign out and sign back in before changing your password.");
      } else {
        setError(error.message || "Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10">
      <div className="border-b border-[#0D0D0D]/10 pb-5 mb-8">
        <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C] block mb-1">
          04 // Security
        </span>
        <h2 className="font-display italic text-3xl text-[#0D0D0D]">
          Password &amp; Access
        </h2>
      </div>

      {isEditingPassword ? (
        <div className="space-y-5 max-w-lg">
          {error && (
            <div className="bg-[#991B1B]/6 border border-[#991B1B]/25 text-[#991B1B] p-4 rounded-[2px] text-xs">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-[#1A5D3A]/6 border border-[#1A5D3A]/25 text-[#1A5D3A] p-4 rounded-[2px] text-xs">
              {success}
            </div>
          )}
          <div>
            <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
              New Password
            </label>
            <input
              type="password"
              className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSavePassword}
              className="px-7 py-3 bg-[#0D0D0D] text-[#F6F5F1] font-body text-[11px] font-semibold rounded-[2px] hover:bg-[#262626] transition-colors disabled:opacity-50 uppercase tracking-[0.22em]"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingPassword(false);
                setError("");
                setSuccess("");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="px-7 py-3 border border-[#0D0D0D]/25 text-[#0D0D0D] font-body text-[11px] font-semibold rounded-[2px] hover:border-[#0D0D0D] transition-colors uppercase tracking-[0.22em]"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#F6F5F1] border border-[#0D0D0D]/10 rounded-[2px] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center justify-center text-[#0D0D0D] flex-shrink-0">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <p className="font-body text-sm font-medium text-[#0D0D0D]">
                Account Password
              </p>
              <p className="font-body text-xs text-[#64625C] mt-1">
                Keep your account secure by updating your password periodically.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingPassword(true)}
            className="self-start sm:self-auto px-6 py-3 bg-[#0D0D0D] text-[#F6F5F1] font-body text-[11px] font-semibold rounded-[2px] hover:bg-[#262626] transition-colors uppercase tracking-[0.2em] whitespace-nowrap"
          >
            Change Password
          </button>
        </div>
      )}
    </div>
  );
};

export default PasswordSection;
