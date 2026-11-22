"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import OrdersSection from "@/components/account/OrdersSection";
import Loader from "@/components/Loader";

export default function AccountOrdersPage() {
  const { user, loading } = useAuth();

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
          <span className="font-mono-tech text-[10px] tracking-[0.3em] uppercase text-[#64625C] block">
            Members Only
          </span>
          <h1 className="font-display italic text-3xl text-[#0D0D0D]">
            Sign In Required
          </h1>
          <p className="font-body text-sm text-[#64625C]">
            Sign in to view your Mystique order history and shipment tracking.
          </p>
          <Link
            href="/account/login"
            className="inline-block bg-[#0D0D0D] text-[#F6F5F1] px-8 py-3.5 rounded-[2px] font-mono-tech text-[11px] font-semibold tracking-[0.22em] uppercase hover:bg-[#262626] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pb-6 border-b border-[#0D0D0D]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#64625C] hover:text-[#0D0D0D] transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back To Account</span>
            </Link>
            <h1 className="font-display italic text-4xl sm:text-5xl font-bold text-[#0D0D0D]">
              Order Archive
            </h1>
          </div>
          <Link
            href="/shop"
            className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#0D0D0D] border-b border-[#0D0D0D] pb-1 self-start sm:self-auto hover:opacity-65 transition-opacity"
          >
            Continue Shopping →
          </Link>
        </div>

        <OrdersSection user={user} />
      </div>
    </div>
  );
}
