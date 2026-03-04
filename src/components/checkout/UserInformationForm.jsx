import React from "react";

const UserInformationForm = ({ formData, handleChange, user }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/60 to-black p-3 sm:p-4 md:p-5 rounded-xl border border-gray-700/50 backdrop-blur shadow-xl">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-white">👤 Contact Information</h2>
      <div className="space-y-2.5 sm:space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-300">Full Name *</label>
          <input
            type="text"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 sm:p-2.5 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
            required
            readOnly={!!user && !!formData.fullName}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-300">Email Address *</label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 sm:p-2.5 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
            required
            readOnly={!!user && !!formData.email}
          />
        </div>
      </div>
    </div>
  );
};

export default UserInformationForm;