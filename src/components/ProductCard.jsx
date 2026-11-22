"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Star, Heart, Check } from "lucide-react";
import formatCurrency from "@/lib/formatCurrency";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "react-toastify";

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
    images = [],
    availableColors = [],
    availableSizes = [],
    variants = [],
    totalStock = 0,
    featured = false,
    newArrival = false,
    bestseller = false,
    averageRating = 0,
    totalReviews = 0,
  } = product;

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const slugValue = typeof slug === "string" ? slug : slug?.current || id;
  const [hovered, setHovered] = useState(false);
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [justAddedSize, setJustAddedSize] = useState(null);

  const wishlisted = isInWishlist(id);
  const isOutOfStock = totalStock === 0;

  const activeVariant = useMemo(() => {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    return variants[activeColorIdx] || variants[0];
  }, [variants, activeColorIdx]);

  const quickSizes = useMemo(() => {
    const baseSizes =
      availableSizes && availableSizes.length > 0
        ? availableSizes
        : ["s", "m", "l", "xl"];
    return baseSizes.slice(0, 5).map((size) => {
      const stock = activeVariant?.sizeStock?.[size] ?? 0;
      return { size, stock, available: stock > 0 };
    });
  }, [availableSizes, activeVariant]);

  const badge = newArrival
    ? { text: "NEW DROP", style: "bg-[#0D0D0D] text-[#F4F2ED] border-[#0D0D0D]" }
    : bestseller
    ? {
        text: "BESTSELLER",
        style: "bg-[#F6F5F1] text-[#0D0D0D] border-[#0D0D0D]/20",
      }
    : featured
    ? { text: "ATELIER", style: "bg-[#0D0D0D] text-[#F4F2ED] border-[#0D0D0D]" }
    : null;

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast(wishlisted ? "Removed from Wishlist" : "Saved to Wishlist", {
      icon: false,
    });
  };

  const handleQuickAdd = (e, sizeObj) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sizeObj.available || !activeVariant) return;

    const colorSlug =
      activeVariant.color?.slug || activeVariant.color?.id || "obsidian";

    addToCart(
      {
        id,
        variantId: activeVariant.id,
        productId: id,
        title,
        price: parseFloat(price),
        image: images[0] || frontImage,
        size: sizeObj.size,
        color: colorSlug,
        quantity: 1,
        productHandle: slugValue,
        stock: sizeObj.stock,
      },
      { openDrawer: true }
    );

    setJustAddedSize(sizeObj.size);
    setTimeout(() => setJustAddedSize(null), 1400);
  };

  const hasSecondaryImage = Boolean(backImage && backImage !== frontImage);

  return (
    <div
      className="group relative flex flex-col text-[#0D0D0D]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${slugValue}`} className="block">
        {/* Studio Stone Image Frame (Unobstructed Bright Silhouette Framing) */}
        <div className="relative w-full overflow-hidden bg-[#EAE8E2] border border-[#0D0D0D]/[0.08] rounded-none aspect-[3/4] transition-colors duration-300 group-hover:border-[#0D0D0D]/30">
          {/* Top-Left Monochrome Status Badge */}
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-20 flex flex-col gap-1">
            {isOutOfStock ? (
              <span className="font-mono-tech text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] uppercase px-2 py-1 rounded-none bg-[#0D0D0D] text-[#F4F2ED] border border-[#0D0D0D]">
                Sold Out
              </span>
            ) : (
              badge && (
                <span
                  className={`font-mono-tech text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] uppercase px-2 py-1 rounded-none border ${badge.style}`}
                >
                  {badge.text}
                </span>
              )
            )}
            {discountPercentage > 0 && !isOutOfStock && (
              <span className="font-mono-tech text-[8px] sm:text-[9px] font-semibold tracking-[0.16em] uppercase px-2 py-0.5 rounded-none bg-[#FFFFFF] text-[#0D0D0D] border border-[#0D0D0D]/20 w-fit">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Top-Right Minimalist Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-20 w-8 h-8 rounded-none flex items-center justify-center border transition-all duration-200 ${
              wishlisted
                ? "bg-[#0D0D0D] border-[#0D0D0D] text-[#F4F2ED] opacity-100"
                : "bg-[#F6F5F1]/90 border-[#0D0D0D]/15 text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F4F2ED] hover:border-[#0D0D0D] opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                wishlisted ? "fill-[#F4F2ED] text-[#F4F2ED]" : ""
              }`}
            />
          </button>

          {/* Primary Front Image */}
          <img
            src={frontImage || "/images/atelier-fabric.jpg"}
            alt={title}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              hovered && hasSecondaryImage
                ? "opacity-0 scale-[1.03]"
                : hovered
                ? "opacity-100 scale-[1.04]"
                : "opacity-100 scale-100"
            }`}
          />

          {/* Secondary Back Image (Unobstructed Reveal on Hover) */}
          {hasSecondaryImage && (
            <img
              src={backImage}
              alt={`${title} alternate view`}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                hovered ? "opacity-100 scale-[1.02]" : "opacity-0 scale-100"
              }`}
            />
          )}

          {/* Slide-Up Quick-Size Add Bar (Desktop Hover — Matte Ink) */}
          {!isOutOfStock && activeVariant && quickSizes.some((s) => s.available) && (
            <div
              className={`hidden sm:block absolute inset-x-0 bottom-0 z-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                hovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-full pointer-events-none"
              }`}
            >
              <div className="bg-[#0D0D0D] text-[#F4F2ED] px-2.5 py-2.5 border-t border-white/15">
                <p className="font-mono-tech text-[8px] tracking-[0.28em] uppercase text-[#8E8B84] text-center mb-2">
                  Quick Add Size
                </p>
                <div className="flex items-center justify-center gap-1">
                  {quickSizes.map((s) => {
                    const isAdded = justAddedSize === s.size;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        disabled={!s.available}
                        onClick={(e) => handleQuickAdd(e, s)}
                        className={`min-w-[30px] h-7 px-1.5 rounded-none font-mono-tech text-[10px] uppercase transition-colors flex items-center justify-center border ${
                          isAdded
                            ? "bg-[#F4F2ED] text-[#0D0D0D] border-[#F4F2ED] font-bold"
                            : s.available
                            ? "bg-transparent text-[#F4F2ED] border-white/20 hover:bg-[#F4F2ED] hover:text-[#0D0D0D] hover:border-[#F4F2ED] font-medium"
                            : "border-white/10 text-white/25 line-through cursor-not-allowed"
                        }`}
                      >
                        {isAdded ? <Check className="w-3 h-3" /> : s.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clean Studio Metadata */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-body text-xs sm:text-[13px] font-medium text-[#0D0D0D] group-hover:underline underline-offset-4 decoration-[#0D0D0D]/40 line-clamp-1 tracking-[0.01em]">
              {title}
            </h3>
            {totalReviews > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                <Star className="w-2.5 h-2.5 fill-[#0D0D0D] text-[#0D0D0D]" />
                <span className="font-mono-tech text-[10px] text-[#64625C]">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Price Row */}
          <div className="flex items-baseline gap-2">
            <span className="font-mono-tech text-xs sm:text-[13px] font-semibold text-[#0D0D0D] tracking-tight">
              {formatCurrency(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="font-mono-tech text-[11px] text-[#64625C] line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          {/* Color Swatches + Low Stock Note */}
          <div className="flex items-center justify-between pt-1 min-h-[20px]">
            {availableColors.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {availableColors.slice(0, 4).map((color, index) => (
                  <button
                    key={color.id || index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveColorIdx(index);
                    }}
                    title={color.name}
                    aria-label={color.name}
                    className={`w-3.5 h-3.5 rounded-none border transition-all duration-200 ${
                      activeColorIdx === index
                        ? "border-[#0D0D0D] ring-1 ring-[#0D0D0D] ring-offset-1 ring-offset-[#F6F5F1]"
                        : "border-[#0D0D0D]/25 hover:border-[#0D0D0D]"
                    }`}
                    style={{ backgroundColor: color.hexCode || "#141414" }}
                  />
                ))}
                {availableColors.length > 4 && (
                  <span className="font-mono-tech text-[9px] text-[#64625C] ml-0.5">
                    +{availableColors.length - 4}
                  </span>
                )}
              </div>
            ) : (
              <span />
            )}

            {!isOutOfStock && totalStock > 0 && totalStock < 10 && (
              <span className="font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#64625C]">
                Only {totalStock} left
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
