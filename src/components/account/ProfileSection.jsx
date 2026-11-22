"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

const ProfileSection = ({ user, userData, updateUserProfile }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(userData?.displayName || "");
  const [savingName, setSavingName] = useState(false);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(userData?.phoneNumber || "");
  const [savingPhone, setSavingPhone] = useState(false);

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      await updateUserProfile({ displayName: newDisplayName });
      setIsEditingName(false);
      toast.success("Display name updated.");
    } catch (error) {
      console.error("[PROFILE] Error updating name:", error);
      toast.error("Failed to update name. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      await updateUserProfile({ phoneNumber: newPhone });
      setIsEditingPhone(false);
      toast.success("Phone number updated.");
    } catch (error) {
      console.error("[PROFILE] Error updating phone:", error);
      toast.error("Failed to update phone number. Please try again.");
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10">
      <div className="border-b border-[#0D0D0D]/10 pb-5 mb-8">
        <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C] block mb-1">
          01 // Identity
        </span>
        <h2 className="font-display italic text-3xl text-[#0D0D0D]">
          Profile Details
        </h2>
      </div>

      {/* Name */}
      <div className="pb-8 mb-8 border-b border-[#0D0D0D]/10">
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-3">
          Display Name
        </label>
        {isEditingName ? (
          <div className="space-y-4 max-w-lg">
            <input
              type="text"
              className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Enter your name"
              disabled={savingName}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveName}
                disabled={savingName}
                className="px-6 py-2.5 bg-[#0D0D0D] text-[#F6F5F1] font-body text-[11px] font-semibold rounded-[2px] hover:bg-[#262626] transition-colors uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {savingName ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingName(false);
                  setNewDisplayName(userData?.displayName || "");
                }}
                disabled={savingName}
                className="px-6 py-2.5 border border-[#0D0D0D]/25 text-[#0D0D0D] font-body text-[11px] font-semibold rounded-[2px] hover:border-[#0D0D0D] transition-colors uppercase tracking-[0.2em]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="font-body text-base text-[#0D0D0D] font-medium">
              {userData?.displayName || "Not set"}
            </p>
            <button
              type="button"
              onClick={() => {
                setNewDisplayName(userData?.displayName || "");
                setIsEditingName(true);
              }}
              className="self-start sm:self-auto px-5 py-2 border border-[#0D0D0D]/25 text-[#0D0D0D] font-mono-tech text-[10px] font-semibold rounded-[2px] hover:border-[#0D0D0D] transition-colors uppercase tracking-[0.2em]"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="pb-8 mb-8 border-b border-[#0D0D0D]/10">
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-3">
          Email Address
        </label>
        <p className="font-body text-base text-[#0D0D0D] font-medium">
          {userData?.email || user?.email}
        </p>
        <p className="font-body text-xs text-[#64625C] mt-1.5">
          Account email is linked to your credentials and cannot be changed here.
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-3">
          Phone Number
        </label>
        {isEditingPhone ? (
          <div className="space-y-4 max-w-lg">
            <input
              type="tel"
              className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm font-mono-tech"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Enter phone number"
              disabled={savingPhone}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSavePhone}
                disabled={savingPhone}
                className="px-6 py-2.5 bg-[#0D0D0D] text-[#F6F5F1] font-body text-[11px] font-semibold rounded-[2px] hover:bg-[#262626] transition-colors uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {savingPhone ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingPhone(false);
                  setNewPhone(userData?.phoneNumber || "");
                }}
                disabled={savingPhone}
                className="px-6 py-2.5 border border-[#0D0D0D]/25 text-[#0D0D0D] font-body text-[11px] font-semibold rounded-[2px] hover:border-[#0D0D0D] transition-colors uppercase tracking-[0.2em]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="font-body text-base text-[#0D0D0D] font-medium">
              {userData?.phoneNumber || "Not provided"}
            </p>
            <button
              type="button"
              onClick={() => {
                setNewPhone(userData?.phoneNumber || "");
                setIsEditingPhone(true);
              }}
              className="self-start sm:self-auto px-5 py-2 border border-[#0D0D0D]/25 text-[#0D0D0D] font-mono-tech text-[10px] font-semibold rounded-[2px] hover:border-[#0D0D0D] transition-colors uppercase tracking-[0.2em]"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
