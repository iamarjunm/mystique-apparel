"use client";

import React, { useState } from "react";
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
      console.error('[ACCOUNT] Logout error:', error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <p className="text-center text-white py-12">You must be logged in to view your account.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[0.18em] text-white mb-10 sm:mb-12 md:mb-16 text-center">
          My Account
        </h1>
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
            {activeSection === "password" && (
              <PasswordSection user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;