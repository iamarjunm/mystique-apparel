"use client";

import React, { useState } from "react";
import Link from "next/link";
import formatCurrency from "@/lib/formatCurrency";

const ProductCard = ({ product }) => {
  const { id, title, price, originalPrice, discountPercentage, frontImage, backImage } = product;
  const productId = id.split("/").pop();

  // State to toggle image on hover
  const [hovered, setHovered] = useState(false);


  return (
    <Link
      href={`/product/${productId}`}
      className="block bg-black text-white p-5 rounded-xl transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image (Increased Size) */}
      <div className="relative w-full max-w-[350px] mx-auto overflow-hidden rounded-xl aspect-[3/4]">
        {/* Primary Image */}
        <img
          src={frontImage || "https://picsum.photos/600/800"} // Bigger fallback image
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hovered ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Secondary Image (Revealed on Hover) */}
        <img
          src={backImage || "https://picsum.photos/600/800"} // Bigger fallback image
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Product Info */}
      <div className="mt-4 text-center">
        {/* Price & Discount */}
        <div className="flex justify-center items-center gap-3 text-xl font-bold">
          <span>{formatCurrency(price)}</span>
          {originalPrice && (
            <span className="text-gray-400 line-through text-sm">
              {formatCurrency(originalPrice)}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="text-red-500 text-sm font-semibold">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="mt-2 text-base font-medium text-gray-300">{title}</h3>
        <p className="text-sm text-gray-500">Premium Oversized Apparel</p>
      </div>
    </Link>
  );
};

export default ProductCard;
