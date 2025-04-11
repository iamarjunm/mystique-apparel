"use client";

import React, { useState } from "react";

const PasswordSection = ({ updatePassword }) => {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    await updatePassword(currentPassword, newPassword);
    setIsEditingPassword(false);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
      <div className="bg-gray-900 p-6 rounded-lg">
        {isEditingPassword ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400">Current Password</label>
              <input
                type="password"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-400">New Password</label>
              <input
                type="password"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-400">Confirm New Password</label>
              <input
                type="password"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="text-center">
              <button onClick={handleSavePassword} className="bg-white text-black px-4 py-2 rounded">
                Save Password
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button onClick={() => setIsEditingPassword(true)} className="bg-gray-700 text-white px-4 py-2 rounded">
              Change Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordSection;