"use client";

import React, { useState } from "react";
import PhoneInput from "../PhoneInput";

const ProfileSection = ({ user, updateName, updatePhone }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newFirstName, setNewFirstName] = useState(user?.firstName || "");
  const [newLastName, setNewLastName] = useState(user?.lastName || "");

  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const handleSaveName = async () => {
    await updateName(newFirstName, newLastName);
    setIsEditingName(false);
  };

  const handlePhoneSubmit = async (phoneData) => {
    await updatePhone(phoneData);
    setIsEditingPhone(false);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
      <div className="bg-gray-900 p-6 rounded-lg">
        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-400">Full Name</label>
          {isEditingName ? (
            <div className="space-y-2">
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                placeholder="First Name"
              />
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                placeholder="Last Name"
              />
              <button onClick={handleSaveName} className="bg-white text-black px-4 py-2 rounded">
                Save Name
              </button>
            </div>
          ) : (
            <div>
              <p>{user.firstName} {user.lastName}</p>
              <button onClick={() => setIsEditingName(true)} className="bg-gray-700 text-white px-4 py-2 rounded mt-2">
                Edit Name
              </button>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-400">Email</label>
          <p>{user.email}</p>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-gray-400">Phone</label>
          {isEditingPhone ? (
            <PhoneInput 
              onSubmit={handlePhoneSubmit}
              onCancel={() => setIsEditingPhone(false)}
              initialPhone={user?.phone}
              initialCountryCode={user?.countryCode}
            />
          ) : (
            <div>
              <p>{user.phone || "Not provided"}</p>
              <button onClick={() => setIsEditingPhone(true)} className="bg-gray-700 text-white px-4 py-2 rounded mt-2">
                Edit Phone
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;