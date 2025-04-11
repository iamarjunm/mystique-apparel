"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/account/Sidebar";
import ProfileSection from "@/components/account/ProfileSection";
import AddressSection from "@/components/account/AddressSection";
import OrdersSection from "@/components/account/OrdersSection";
import PasswordSection from "@/components/account/PasswordSection";
import Loader from "@/components/Loader";

const AccountPage = () => {
  const { user, loading, updateAddress, logout, updatePhone, updateName, updatePassword, deleteAddress } = useUser();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState("profile");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <p className="text-center text-white py-12">You must be logged in to view your account.</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white py-10">
      <div className="container mx-auto px-4 flex">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          handleLogout={handleLogout}
        />
        <div className="w-3/4">
          {activeSection === "profile" && (
            <ProfileSection
              user={user}
              updateName={updateName}
              updatePhone={updatePhone}
            />
          )}
          {activeSection === "address" && (
            <AddressSection
              user={user}
              updateAddress={updateAddress}
              deleteAddress={deleteAddress}
            />
          )}
          {activeSection === "orders" && <OrdersSection />}
          {activeSection === "password" && (
            <PasswordSection
              updatePassword={updatePassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;