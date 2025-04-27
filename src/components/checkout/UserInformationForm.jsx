import React from "react";

const UserInformationForm = ({ formData, handleChange, user }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Information</h2>
      <div className="space-y-4">
        {/* Full Name */}
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800 text-white"
          required
          readOnly={!!user}
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800 text-white"
          required
          readOnly={!!user}
        />
      </div>
    </div>
  );
};

export default UserInformationForm;