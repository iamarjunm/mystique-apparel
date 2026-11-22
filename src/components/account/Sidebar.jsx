"use client";

import React from "react";
import { User, MapPin, Package, Lock, LogOut } from "lucide-react";

const Sidebar = ({ activeSection, setActiveSection, handleLogout }) => {
  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "address", label: "Addresses", icon: MapPin },
    { id: "orders", label: "Orders", icon: Package },
    { id: "password", label: "Password", icon: Lock },
  ];

  return (
    <div className="w-full lg:w-60 lg:sticky lg:top-28 lg:self-start flex-shrink-0">
      <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-5">
        <h2 className="font-mono-tech text-[10px] font-semibold text-[#64625C] mb-4 uppercase tracking-[0.26em] pb-3.5 border-b border-[#0D0D0D]/10">
          Navigation
        </h2>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-[2px] transition-colors flex items-center gap-3 ${
                    active
                      ? "bg-[#0D0D0D] text-[#F6F5F1]"
                      : "text-[#64625C] hover:bg-[#EAE8E2] hover:text-[#0D0D0D]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-mono-tech text-[10px] font-semibold uppercase tracking-[0.2em]">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 pt-4 border-t border-[#0D0D0D]/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-3.5 py-3 rounded-[2px] text-[#991B1B] hover:bg-[#991B1B]/6 transition-colors flex items-center gap-3"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="font-mono-tech text-[10px] font-semibold uppercase tracking-[0.2em]">
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
