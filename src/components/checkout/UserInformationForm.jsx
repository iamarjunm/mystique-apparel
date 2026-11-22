import React from "react";
import { User } from "lucide-react";

const UserInformationForm = ({ formData, handleChange, user }) => {
  return (
    <div className="bg-white border border-[#0D0D0D]/12 p-5 sm:p-6 rounded-[2px] space-y-4">
      <div className="flex items-center gap-2.5 border-b border-[#0D0D0D]/10 pb-4">
        <User className="w-4 h-4 text-[#0D0D0D]" />
        <h2 className="font-display italic text-xl sm:text-2xl text-[#0D0D0D]">
          Contact Information
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            placeholder="Your full name"
            value={formData.fullName}
            onChange={handleChange}
            className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm read-only:bg-[#EAE8E2]/60 read-only:text-[#64625C]"
            required
            readOnly={!!user && !!formData.fullName}
          />
        </div>

        <div>
          <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@domain.com"
            value={formData.email}
            onChange={handleChange}
            className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm read-only:bg-[#EAE8E2]/60 read-only:text-[#64625C]"
            required
            readOnly={!!user && !!formData.email}
          />
        </div>
      </div>
    </div>
  );
};

export default UserInformationForm;
