"use client";

import React, { useState } from "react";

const ProfileSection = ({ user, userData, updateUserProfile }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(userData?.displayName || "");

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(userData?.phoneNumber || "");

  const handleSaveName = async () => {
    try {
      await updateUserProfile({ displayName: newDisplayName });
      setIsEditingName(false);
    } catch (error) {
      console.error('[PROFILE] Error updating name:', error);
      alert('Failed to update name');
    }
  };

  const handleSavePhone = async () => {
    try {
      await updateUserProfile({ phoneNumber: newPhone });
      setIsEditingPhone(false);
    } catch (error) {
      console.error('[PROFILE] Error updating phone:', error);
      alert('Failed to update phone');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-8 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-10 uppercase tracking-[0.15em]">
          Profile
        </h2>
        
        {/* Name */}
        <div className="mb-10">
          <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
            Display Name
          </label>
          {isEditingName ? (
            <div className="space-y-4">
              <input
                type="text"
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
              <div className="flex gap-3">
                <button 
                  onClick={handleSaveName} 
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-wider text-sm"
                >
                  Save
                </button>
                <button 
                  onClick={() => setIsEditingName(false)} 
                  className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-wider text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xl text-zinc-100 mb-4 font-medium">{userData?.displayName || 'Not set'}</p>
              <button 
                onClick={() => setIsEditingName(true)} 
                className="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all uppercase tracking-wider"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="mb-10">
          <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
            Email Address
          </label>
          <p className="text-xl text-zinc-100 font-medium">{userData?.email || user?.email}</p>
          <p className="text-xs text-zinc-500 mt-2 italic">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
            Phone Number
          </label>
          {isEditingPhone ? (
            <div className="space-y-4">
              <input
                type="tel"
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Enter phone number"
              />
              <div className="flex gap-3">
                <button 
                  onClick={handleSavePhone} 
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-wider text-sm"
                >
                  Save
                </button>
                <button 
                  onClick={() => setIsEditingPhone(false)} 
                  className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-wider text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xl text-zinc-100 mb-4 font-medium">{userData?.phoneNumber || "Not provided"}</p>
              <button 
                onClick={() => setIsEditingPhone(true)} 
                className="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all uppercase tracking-wider"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;