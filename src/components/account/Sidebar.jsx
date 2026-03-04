"use client";

import React from "react";
import { FiUser, FiMapPin, FiPackage, FiLock, FiLogOut } from "react-icons/fi";

const Sidebar = ({ activeSection, setActiveSection, handleLogout }) => {
  const menuItems = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "address", label: "Addresses", icon: FiMapPin },
    { id: "orders", label: "Orders", icon: FiPackage },
    { id: "password", label: "Password", icon: FiLock },
  ];

  return (
    <div className="w-full lg:w-56 lg:sticky lg:top-24 lg:self-start flex-shrink-0">
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-bold text-zinc-100 mb-5 uppercase tracking-[0.15em] pb-4 border-b border-white/10">
          Menu
        </h2>
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-300 flex items-center gap-2.5 group ${
                    activeSection === item.id
                      ? "bg-white text-black shadow-lg shadow-white/20"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
                  }`}
                >
                  <Icon className={`text-base ${activeSection === item.id ? "text-black" : "text-zinc-400 group-hover:text-white"}`} />
                  <span className={`font-bold text-[10px] uppercase tracking-wider ${activeSection === item.id ? "text-black" : ""}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 pt-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 flex items-center gap-2.5 border border-transparent hover:border-red-500/20 group"
          >
            <FiLogOut className="text-base group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;