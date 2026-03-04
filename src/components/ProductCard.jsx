"use client";

import React, { useState } from "react";
import Link from "next/link";
import formatCurrency from "@/lib/formatCurrency";

const ProductCard = ({ product }) => {
  const { 
    id, 
    slug, 
    title, 
    price, 
    originalPrice, 
    discountPercentage, 
    frontImage, 
    backImage,
    availableColors = [],
    availableSizes = [],
    totalStock = 0,
    featured = false,
    newArrival = false,
    bestseller = false,
  } = product;
  
  // Handle slug - could be string or object with current property
  const slugValue = typeof slug === 'string' ? slug : slug?.current || id;

  // State to toggle image on hover
  const [hovered, setHovered] = useState(false);

  // Determine badge to display (priority: new arrival > featured > bestseller)
  const badge = newArrival ? { text: "NEW", color: "bg-green-600" } 
    : featured ? { text: "FEATURED", color: "bg-blue-600" }
    : bestseller ? { text: "BESTSELLER", color: "bg-purple-600" }
    : null;

  const isOutOfStock = totalStock === 0;

  return (
    <Link
      href={`/product/${slugValue}`}
      className="block text-white transition-all duration-300 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image */}
      <div className="relative w-full overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-lg aspect-[3/4] transition-all duration-300 group-hover:border-white/20">
        {/* Badge */}
        {badge && (
          <div className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 ${badge.color} text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 uppercase tracking-wider z-10 rounded`}>
            {badge.text}
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-red-600 text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 uppercase tracking-wider z-10 rounded">
            OUT OF STOCK
          </div>
        )}

        {/* Primary Image */}
        <img
          src={frontImage || "https://picsum.photos/600/800"}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500 ${
            hovered ? "opacity-0" : "opacity-100"
          }`}
        />
        
        {/* Secondary Image (Revealed on Hover) */}
        <img
          src={backImage || frontImage || "https://picsum.photos/600/800"}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Quick View Overlay on Hover */}
        <div className={`absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}>
          <div className="text-center">
            <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm uppercase tracking-wider block mb-1">View Details</span>
            <div className="w-6 sm:w-8 h-[1px] bg-white mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-1.5 sm:mt-2 md:mt-3">
        {/* Product Name */}
        <h3 className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-100 line-clamp-2 min-h-[1.5rem] sm:min-h-[2rem] uppercase tracking-wide">{title}</h3>

        {/* Available Colors */}
        {availableColors.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
            <div className="flex gap-0.5 sm:gap-1">
              {availableColors.slice(0, 4).map((color, index) => (
                <div
                  key={color.id || index}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full border border-white/20 hover:border-white transition-colors"
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              ))}
              {availableColors.length > 4 && (
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full border border-white/20 bg-zinc-800 flex items-center justify-center text-[7px] sm:text-[8px] text-gray-400">
                  +{availableColors.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price & Discount */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
          <span className="text-xs sm:text-sm md:text-base font-bold text-white">{formatCurrency(price)}</span>
          {originalPrice && originalPrice > price && (
            <>
              <span className="text-gray-500 line-through text-[9px] sm:text-[10px] md:text-xs">
                {formatCurrency(originalPrice)}
              </span>
              <span className="text-red-400 text-[9px] sm:text-[10px] md:text-xs font-bold">
                -{discountPercentage}%
              </span>
            </>
          )}
        </div>

        {/* Stock Info */}
        {!isOutOfStock && totalStock < 10 && (
          <p className="text-[9px] sm:text-[10px] md:text-xs text-yellow-500 mt-0.5 sm:mt-1">Only {totalStock} left</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

