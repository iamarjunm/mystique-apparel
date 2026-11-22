"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/account/Sidebar";
import ProfileSection from "@/components/account/ProfileSection";
import AddressSection from "@/components/account/AddressSection";
import OrdersSection from "@/components/account/OrdersSection";
import PasswordSection from "@/components/account/PasswordSection";
import Loader from "@/components/Loader";

const AccountPage = () => {
  const { user, userData, loading, updateUserProfile, signOut } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("profile");

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("[ACCOUNT] Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] bg-[#F6F5F1] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[75vh] bg-[#F6F5F1] text-[#0D0D0D] flex items-center justify-center px-4">
        <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-10 max-w-md w-full text-center space-y-5">
          <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block">
            Members Only
          </span>
          <h1 className="font-display italic text-3xl text-[#0D0D0D]">
            Sign In Required
          </h1>
          <p className="font-body text-sm text-[#64625C]">
            Sign in to access your order history, saved addresses, and profile.
          </p>
          <Link
            href="/account/login"
            className="inline-block bg-[#0D0D0D] text-[#F6F5F1] px-8 py-3.5 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-[#262626] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pb-8 border-b border-[#0D0D0D]/12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block mb-2">
              Member Dossier
            </span>
            <h1 className="font-display italic text-4xl sm:text-5xl font-semibold text-[#0D0D0D] tracking-[-0.015em]">
              My Account
            </h1>
          </div>
          <p className="font-mono-tech text-[11px] text-[#64625C] tracking-[0.14em]">
            {userData?.email || user?.email}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            handleLogout={handleLogout}
          />
          <div className="flex-1 min-w-0">
            {activeSection === "profile" && (
              <ProfileSection
                user={user}
                userData={userData}
                updateUserProfile={updateUserProfile}
              />
            )}
            {activeSection === "address" && (
              <AddressSection
                user={user}
                userData={userData}
                updateUserProfile={updateUserProfile}
              />
            )}
            {activeSection === "orders" && <OrdersSection user={user} />}
            {activeSection === "password" && <PasswordSection user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
