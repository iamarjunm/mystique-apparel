"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Crisp Editorial Header */}
        <header className="mb-10 sm:mb-12 border-b border-[#0D0D0D]/12 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block mb-3">
              MYSTIQUE APPAREL // SAVED PIECES
            </span>
            <h1 className="font-display italic text-4xl sm:text-5xl font-normal text-[#0D0D0D] leading-[1.05]">
              Saved Pieces
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block w-8 h-px bg-[#0D0D0D]/25" />
            <p className="font-mono-tech text-[11px] text-[#64625C] uppercase tracking-[0.24em]">
              {String(wishlist.length).padStart(2, "0")}{" "}
              {wishlist.length === 1 ? "Saved Piece" : "Saved Pieces"}
            </p>
          </div>
        </header>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:gap-x-7 lg:gap-y-14">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center bg-white border border-[#0D0D0D]/12 rounded-none p-10 sm:p-14 my-8">
            <div className="w-14 h-14 rounded-none bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-5 h-5 text-[#0D0D0D] stroke-[1.5]" />
            </div>
            <span className="font-mono-tech text-[10px] tracking-[0.3em] uppercase text-[#64625C] block mb-2">
              Archive Shortlist Empty
            </span>
            <h2 className="font-display italic text-3xl text-[#0D0D0D] mb-3">
              Nothing Saved Yet
            </h2>
            <p className="font-body text-sm text-[#64625C] mb-8 leading-relaxed">
              Select the heart icon on any silhouette to curate your personal Mystique archive shortlist.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 bg-[#0D0D0D] text-[#F6F5F1] hover:bg-[#262626] py-3.5 px-9 rounded-none font-mono-tech text-[11px] tracking-[0.24em] uppercase transition-colors"
            >
              <span>Explore Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
