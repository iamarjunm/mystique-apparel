"use client";

import React from "react";

const Sidebar = ({ activeSection, setActiveSection, handleLogout }) => {
  return (
    <div className="w-1/4 bg-gray-900 p-6 rounded-lg mr-6">
      <h2 className="text-xl font-semibold mb-4">My Account</h2>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => setActiveSection("profile")}
            className={`w-full text-left p-2 rounded ${
              activeSection === "profile" ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            Profile
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveSection("address")}
            className={`w-full text-left p-2 rounded ${
              activeSection === "address" ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            Address
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveSection("orders")}
            className={`w-full text-left p-2 rounded ${
              activeSection === "orders" ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            Orders
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveSection("password")}
            className={`w-full text-left p-2 rounded ${
              activeSection === "password" ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            Change Password
          </button>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="w-full text-left p-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;