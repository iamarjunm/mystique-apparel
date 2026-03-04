"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminNav from "./components/AdminNav";
import Loader from "@/components/Loader";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (loading) {
      return;
    }

    // If not logged in or not admin, redirect
    if (!user || !userData?.isAdmin) {
      console.log('[ADMIN-LAYOUT] Access denied:', { user: !!user, isAdmin: userData?.isAdmin });
      router.push("/");
      return;
    }

    console.log('[ADMIN-LAYOUT] Access granted for admin user:', userData.email);
    setIsAuthorized(true);
  }, [user, userData, loading, router]);

  if (loading || isAuthorized === null) {
    return <Loader />;
  }

  if (!isAuthorized) {
    return <Loader />;
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-black/80 backdrop-blur-md border border-white/20 p-2 rounded-lg hover:bg-black transition-colors"
      >
        {isSidebarOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
      </button>

      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminNav onNavigate={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto w-full">
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black p-4 sm:p-6 md:p-8 lg:pl-8">
          {children}
        </div>
      </div>
    </div>
  );
}
