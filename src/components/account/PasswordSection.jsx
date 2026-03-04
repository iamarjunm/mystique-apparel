"use client";

import React, { useState } from "react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

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
    console.log('[PASSWORD] Attempting to change password...');

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      console.log('[PASSWORD] Re-authentication successful');

      // Update password
      await updatePassword(user, newPassword);
      console.log('[PASSWORD] Password updated successfully');

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        setIsEditingPassword(false);
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error('[PASSWORD] Error:', error);
      if (error.code === 'auth/wrong-password') {
        setError("Current password is incorrect.");
      } else if (error.code === 'auth/requires-recent-login') {
        setError("Please log out and log back in before changing your password.");
      } else {
        setError(error.message || "Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-8 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-10 uppercase tracking-[0.15em]">
          Password
        </h2>
        {isEditingPassword ? (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-5 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-300 p-5 rounded-xl">
                {success}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleSavePassword} 
                className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Password'}
              </button>
              <button 
                onClick={() => {
                  setIsEditingPassword(false);
                  setError("");
                  setSuccess("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }} 
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-wider text-sm"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-300 mb-8 text-lg">Keep your account secure by updating your password regularly.</p>
            <button 
              onClick={() => setIsEditingPassword(true)} 
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-wider text-sm"
            >
              Change Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordSection;