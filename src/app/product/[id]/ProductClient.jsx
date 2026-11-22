"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Share2,
  Ruler,
  X,
  ZoomIn,
  Layers,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { fetchProductById, fetchProducts } from "@/lib/fetchProducts";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Reviews from "@/components/Reviews";
import formatCurrency from "@/lib/formatCurrency";
import { toast } from "react-toastify";

const DEFAULT_SIZE_CHART = [
  { size: "XS", chest: "40 in", length: "27 in", shoulder: "19.5 in" },
  { size: "S", chest: "42 in", length: "28 in", shoulder: "20.5 in" },
  { size: "M", chest: "44 in", length: "29 in", shoulder: "21.5 in" },
  { size: "L", chest: "46 in", length: "30 in", shoulder: "22.5 in" },
  { size: "XL", chest: "48 in", length: "31 in", shoulder: "23.5 in" },
  { size: "XXL", chest: "50 in", length: "32 in", shoulder: "24.5 in" },
];

export default function ProductClient({ id, initialProduct = null }) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColorSlug, setSelectedColorSlug] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [expandedSection, setExpandedSection] = useState("about");
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Initialize default color & first in-stock size whenever product loads
  useEffect(() => {
    if (!product) return;
    if (product.availableColors?.length > 0 && !selectedColorSlug) {
      const firstColorSlug =
        product.availableColors[0].slug || product.availableColors[0].id;
      setSelectedColorSlug(firstColorSlug);

      const firstVariant = product.variants?.find(
        (v) => v.color?.slug === firstColorSlug || v.color?.id === firstColorSlug
      );
      if (firstVariant?.sizeStock) {
        const sizes = product.availableSizes || ["xs", "s", "m", "l", "xl", "xxl"];
        const firstInStock = sizes.find((sz) => (firstVariant.sizeStock[sz] || 0) > 0);
        if (firstInStock) setSelectedSize(firstInStock);
      }
    }
  }, [product, selectedColorSlug]);

  // Fetch product if not SSR-provided, and load recommendations
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        let currentProduct = initialProduct;
        if (!currentProduct) {
          currentProduct = await fetchProductById(id);
          if (active) setProduct(currentProduct);
        }

        const allProducts = await fetchProducts();
        if (active && Array.isArray(allProducts) && currentProduct) {
          const recs = allProducts
            .filter((p) => p.id !== currentProduct.id)
            .slice(0, 4);
          setRecommendedProducts(recs);
        }
      } catch (error) {
        console.error("[PDP] Error loading product:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [id, initialProduct]);

  const activeVariant = useMemo(() => {
    if (!product?.variants || !selectedColorSlug) return null;
    return product.variants.find(
      (v) => v.color?.slug === selectedColorSlug || v.color?.id === selectedColorSlug
    );
  }, [product, selectedColorSlug]);

  const availableStock = useMemo(() => {
    if (!selectedSize || !activeVariant) return 0;
    return activeVariant.sizeStock?.[selectedSize] || 0;
  }, [selectedSize, activeVariant]);

  const selectedColorName = useMemo(() => {
    if (!product?.availableColors || !selectedColorSlug) return "";
    const match = product.availableColors.find(
      (c) => (c.slug || c.id) === selectedColorSlug
    );
    return match?.name || selectedColorSlug;
  }, [product, selectedColorSlug]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const list = product.images?.length ? product.images : [product.frontImage];
    return list.filter(Boolean);
  }, [product]);

  // Keyboard shortcuts for Lightbox & Size Guide modal
  useEffect(() => {
    if (!lightboxOpen && !showSizeGuideModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setShowSizeGuideModal(false);
      }
      if (lightboxOpen && gallery.length > 1 && e.key === "ArrowRight") {
        setSelectedImage((prev) => (prev + 1) % gallery.length);
      }
      if (lightboxOpen && gallery.length > 1 && e.key === "ArrowLeft") {
        setSelectedImage((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, showSizeGuideModal, gallery.length]);

  const wishlisted = product ? isInWishlist(product.id) : false;

  const handleColorSelection = (color) => {
    const slug = color.slug || color.id;
    setSelectedColorSlug(slug);
    setQuantity(1);
    const variant = product.variants?.find(
      (v) => v.color?.slug === slug || v.color?.id === slug
    );
    const sizes = product.availableSizes || ["xs", "s", "m", "l", "xl", "xxl"];
    const nextInStock = sizes.find((sz) => (variant?.sizeStock?.[sz] || 0) > 0);
    setSelectedSize(nextInStock || null);
  };

  const handleSizeSelection = (size) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      if (quantity < availableStock) {
        setQuantity((q) => q + 1);
      } else {
        toast.info(`Only ${availableStock} pieces available in this size.`);
      }
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const validateSelection = () => {
    if (!selectedColorSlug) {
      toast.error("Please select a shade.");
      return false;
    }
    if (!selectedSize) {
      toast.error("Please select your size.");
      return false;
    }
    if (availableStock <= 0 || !activeVariant) {
      toast.error("This size and shade combination is currently sold out.");
      return false;
    }
    return true;
  };

  const buildCartPayload = () => ({
    id: product.id,
    variantId: activeVariant.id,
    productId: product.id,
    title: product.title,
    price: parseFloat(product.price),
    image: gallery[0] || product.frontImage,
    size: selectedSize,
    color: selectedColorSlug,
    quantity,
    productHandle: product.slug,
    stock: availableStock,
  });

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addToCart(buildCartPayload(), { openDrawer: true });
    toast.success(`${product.title} (${selectedSize.toUpperCase()}) added to bag`);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    addToCart(buildCartPayload(), { openDrawer: false });
    router.push("/checkout");
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} | Mystique Apparel`,
          text: `Explore ${product.title} at Mystique Apparel`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.info("Product link copied to clipboard");
    }
  };

  const nextImage = () =>
    setSelectedImage((prev) => (prev + 1) % Math.max(1, gallery.length));
  const prevImage = () =>
    setSelectedImage(
      (prev) => (prev - 1 + Math.max(1, gallery.length)) % Math.max(1, gallery.length)
    );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-[3/4] rounded-none skeleton-shimmer border border-[#0D0D0D]/8" />
          <div className="lg:col-span-5 space-y-5 pt-4">
            <div className="h-3.5 w-32 rounded-none skeleton-shimmer" />
            <div className="h-10 w-3/4 rounded-none skeleton-shimmer" />
            <div className="h-7 w-40 rounded-none skeleton-shimmer" />
            <div className="h-28 w-full rounded-none skeleton-shimmer" />
            <div className="h-14 w-full rounded-none skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[75vh] bg-[#F6F5F1] text-[#0D0D0D] flex flex-col items-center justify-center px-4 text-center">
        <p className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] mb-3">
          404 // Archive Entry Missing
        </p>
        <h1 className="font-display italic text-4xl sm:text-5xl text-[#0D0D0D] mb-4">
          Piece Not Found
        </h1>
        <p className="font-body text-sm text-[#64625C] max-w-md mb-8 leading-relaxed">
          This silhouette may have sold out or moved to a private archive release.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3.5 rounded-none bg-[#0D0D0D] text-[#F6F5F1] hover:bg-[#262626] font-mono-tech text-[11px] tracking-[0.24em] uppercase transition-colors"
        >
          Return To Archive
        </Link>
      </div>
    );
  }

  const canPurchase = Boolean(selectedSize && selectedColorSlug && availableStock > 0);

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] pb-28 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Crisp Architectural Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2.5 font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#64625C] pb-6 mb-8 border-b border-[#0D0D0D]/12 overflow-x-auto whitespace-nowrap"
        >
          <Link href="/" className="hover:text-[#0D0D0D] transition-colors">
            Home
          </Link>
          <span className="text-[#0D0D0D]/25">/</span>
          <Link href="/shop" className="hover:text-[#0D0D0D] transition-colors">
            Archive
          </Link>
          <span className="text-[#0D0D0D]/25">/</span>
          <span className="text-[#0D0D0D] truncate">{product.title}</span>
        </nav>

        {/* Main 12-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* LEFT COLUMN (7 Cols): Museum Gallery Showcase */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-3 sm:gap-4">
            {/* Vertical Thumbnail Rail on Desktop */}
            {gallery.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:w-20 flex-shrink-0 hide-scrollbar">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`relative w-16 h-20 md:w-20 md:h-24 rounded-none overflow-hidden flex-shrink-0 bg-[#EAE8E2] border transition-all duration-200 ${
                      selectedImage === idx
                        ? "border-[#0D0D0D] opacity-100"
                        : "border-[#0D0D0D]/12 opacity-60 hover:opacity-100 hover:border-[#0D0D0D]/40"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Studio Stone Main Portrait Stage */}
            <div className="relative flex-1 rounded-none overflow-hidden bg-[#EAE8E2] border border-[#0D0D0D]/10 aspect-[3/4] group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={gallery[selectedImage] || selectedImage}
                  src={gallery[selectedImage] || product.frontImage || "/tshirt.jpg"}
                  alt={product.title}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.4 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setLightboxOpen(true)}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
              </AnimatePresence>

              {/* Top Overlay Badges & Actions */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between z-10 pointer-events-none">
                <div className="flex flex-col gap-1.5 pointer-events-auto">
                  {product.newArrival && (
                    <span className="font-mono-tech text-[9px] tracking-[0.26em] uppercase px-2.5 py-1 bg-[#0D0D0D] text-[#F6F5F1] w-fit">
                      New Drop
                    </span>
                  )}
                  {product.discountPercentage > 0 && (
                    <span className="font-mono-tech text-[9px] tracking-[0.22em] uppercase px-2.5 py-1 bg-white text-[#0D0D0D] border border-[#0D0D0D]/15 w-fit">
                      Save {product.discountPercentage}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => {
                      toggleWishlist(product);
                      toast(wishlisted ? "Removed from Wishlist" : "Saved to Wishlist", {
                        icon: false,
                      });
                    }}
                    className={`w-10 h-10 rounded-none border flex items-center justify-center transition-colors ${
                      wishlisted
                        ? "bg-[#0D0D0D] border-[#0D0D0D] text-[#F6F5F1]"
                        : "bg-white/95 border-[#0D0D0D]/15 text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] hover:border-[#0D0D0D]"
                    }`}
                    aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="w-10 h-10 rounded-none bg-white/95 border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] hover:border-[#0D0D0D] transition-colors"
                    aria-label="Zoom image"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subtle Prev/Next Controls & Gallery Index */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-none bg-white/95 border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] hover:border-[#0D0D0D] transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-none bg-white/95 border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] hover:border-[#0D0D0D] transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3.5 right-3.5 px-3 py-1.5 bg-[#0D0D0D] text-[#F6F5F1] font-mono-tech text-[10px] tracking-[0.2em]">
                    {String(selectedImage + 1).padStart(2, "0")} /{" "}
                    {String(gallery.length).padStart(2, "0")}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (5 Cols, Sticky): Atelier Purchase Specification */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="font-mono-tech text-[10px] tracking-[0.32em] uppercase text-[#64625C]">
                  Mystique Atelier
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#64625C] hover:text-[#0D0D0D] transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              <h1 className="font-display italic text-3xl sm:text-4xl font-normal text-[#0D0D0D] leading-[1.12] tracking-[-0.015em]">
                {product.title}
              </h1>

              {/* Rating & Reviews Jump Link */}
              {product.totalReviews > 0 && (
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-2 mt-3 group"
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(product.averageRating)
                            ? "fill-[#0D0D0D] text-[#0D0D0D]"
                            : "text-[#0D0D0D]/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono-tech text-[11px] text-[#64625C] group-hover:text-[#0D0D0D] underline-offset-4 group-hover:underline transition-colors">
                    {product.averageRating.toFixed(1)} ({product.totalReviews}{" "}
                    {product.totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </a>
              )}

              {/* Price Display */}
              <div className="flex flex-wrap items-baseline gap-3 mt-5 pb-6 border-b border-[#0D0D0D]/12">
                <span className="font-body text-2xl sm:text-3xl font-semibold text-[#0D0D0D] tracking-tight">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="font-body text-base text-[#64625C] line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                    <span className="font-mono-tech text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 bg-[#0D0D0D] text-[#F6F5F1]">
                      Save {product.discountPercentage}%
                    </span>
                  </>
                )}
                <span className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#64625C] ml-auto">
                  Incl. All Taxes
                </span>
              </div>
            </div>

            {/* Color Selector */}
            {product.availableColors?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C]">
                    Shade
                  </span>
                  <span className="font-body text-xs font-medium text-[#0D0D0D] capitalize">
                    {selectedColorName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color, idx) => {
                    const cSlug = color.slug || color.id;
                    const active = selectedColorSlug === cSlug;
                    return (
                      <button
                        key={`${cSlug}-${idx}`}
                        type="button"
                        onClick={() => handleColorSelection(color)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-none border transition-colors ${
                          active
                            ? "bg-white border-[#0D0D0D] text-[#0D0D0D] ring-1 ring-[#0D0D0D]"
                            : "bg-white border-[#0D0D0D]/15 text-[#64625C] hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-[#0D0D0D]/25 flex-shrink-0"
                          style={{ backgroundColor: color.hexCode || "#0D0D0D" }}
                        />
                        <span className="font-body text-xs capitalize">
                          {color.name || `Shade ${idx + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Architectural Size Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C]">
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeGuideModal(true)}
                  className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#0D0D0D] underline underline-offset-4 hover:opacity-70 transition-opacity"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size &amp; Fit Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {(product.availableSizes || ["xs", "s", "m", "l", "xl", "xxl"]).map(
                  (size) => {
                    const sizeStock = activeVariant?.sizeStock?.[size] || 0;
                    const isAvailable = sizeStock > 0;
                    const active = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => handleSizeSelection(size)}
                        className={`relative py-3 rounded-none font-mono-tech text-xs uppercase border transition-colors ${
                          active
                            ? "bg-[#0D0D0D] text-[#F6F5F1] border-[#0D0D0D] font-semibold"
                            : isAvailable
                            ? "bg-white text-[#0D0D0D] border-[#0D0D0D]/15 hover:border-[#0D0D0D]"
                            : "bg-[#EAE8E2]/70 text-[#64625C]/45 border-[#0D0D0D]/10 line-through cursor-not-allowed"
                        }`}
                      >
                        {size}
                        {isAvailable && sizeStock <= 5 && !active && (
                          <span
                            title={`Only ${sizeStock} left`}
                            className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#0D0D0D]"
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Live Stock Indicator */}
              {selectedSize && (
                <div className="flex items-center gap-2 pt-0.5">
                  {availableStock > 0 ? (
                    <>
                      <span
                        className={`w-1.5 h-1.5 ${
                          availableStock <= 5 ? "bg-[#0D0D0D]" : "bg-[#0D0D0D]/60"
                        }`}
                      />
                      <span className="font-mono-tech text-[10px] tracking-[0.16em] uppercase text-[#64625C]">
                        {availableStock <= 5
                          ? `Low archive stock — ${availableStock} left in ${selectedSize.toUpperCase()}`
                          : "In stock — ready for atelier dispatch"}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono-tech text-[10px] tracking-[0.16em] uppercase text-[#64625C]">
                      Sold out in this variant
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Stepper + Primary Purchase Actions */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-stretch gap-2.5">
                {/* Crisp Quantity Stepper */}
                <div className="flex items-center bg-white border border-[#0D0D0D]/20">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("decrease")}
                    className="w-10 h-full flex items-center justify-center text-[#0D0D0D] hover:bg-[#EAE8E2] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono-tech text-xs text-[#0D0D0D] w-9 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("increase")}
                    className="w-10 h-full flex items-center justify-center text-[#0D0D0D] hover:bg-[#EAE8E2] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Solid Ink ADD TO BAG */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canPurchase}
                  className={`flex-1 py-4 px-6 rounded-none font-mono-tech text-[11px] font-medium tracking-[0.24em] uppercase flex items-center justify-center gap-2.5 transition-colors ${
                    canPurchase
                      ? "bg-[#0D0D0D] text-[#F6F5F1] hover:bg-[#262626]"
                      : "bg-[#EAE8E2] text-[#64625C] border border-[#0D0D0D]/10 cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{canPurchase ? "Add To Bag" : "Select Available Size"}</span>
                </button>
              </div>

              {/* Hairline Outline EXPRESS CHECKOUT */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!canPurchase}
                className={`w-full py-3.5 px-6 rounded-none font-mono-tech text-[11px] tracking-[0.24em] uppercase flex items-center justify-center gap-2 border transition-colors ${
                  canPurchase
                    ? "bg-transparent border-[#0D0D0D]/25 text-[#0D0D0D] hover:border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1]"
                    : "bg-transparent border-[#0D0D0D]/10 text-[#64625C]/50 cursor-not-allowed"
                }`}
              >
                <span>Express Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2x2 Architectural Garment Spec Grid */}
            <div className="grid grid-cols-2 border border-[#0D0D0D]/12 bg-white">
              {[
                {
                  icon: Layers,
                  label: product.weight || "240 GSM Heavyweight",
                  sub: product.material || "100% Combed Cotton",
                },
                {
                  icon: Truck,
                  label: "Complimentary Shipping ₹999+",
                  sub: "Tracked Pan-India Dispatch",
                },
                {
                  icon: ShieldCheck,
                  label: "Atelier QC Inspected",
                  sub: "Verified Before Sealing",
                },
                {
                  icon: CreditCard,
                  label: "Razorpay & COD",
                  sub: "UPI, Cards or ₹150 COD",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                const borderClasses = `${idx % 2 === 1 ? "border-l border-[#0D0D0D]/12" : ""} ${
                  idx >= 2 ? "border-t border-[#0D0D0D]/12" : ""
                }`;
                return (
                  <div
                    key={item.label}
                    className={`p-3.5 flex items-start gap-2.5 ${borderClasses}`}
                  >
                    <Icon className="w-4 h-4 text-[#0D0D0D] flex-shrink-0 mt-0.5 stroke-[1.5]" />
                    <div className="min-w-0">
                      <p className="font-body text-[11px] font-medium text-[#0D0D0D] truncate">
                        {item.label}
                      </p>
                      <p className="font-body text-[10px] text-[#64625C] truncate mt-0.5">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Framer Motion Hairline Accordions */}
            <div className="divide-y divide-[#0D0D0D]/12 border-y border-[#0D0D0D]/12">
              {[
                {
                  id: "about",
                  title: "Garment Notes",
                  content:
                    product.description ||
                    "Engineered with heavyweight 240 GSM combed cotton in Mystique's signature oversized drop-shoulder block for structured drape and enduring form.",
                },
                {
                  id: "care",
                  title: "Fabric & Care",
                  content:
                    product.careInstructions ||
                    "Machine wash cold inside-out with like colors. Use mild detergent. Do not bleach. Lay flat or hang dry in shade. Iron low on reverse side.",
                },
                {
                  id: "delivery",
                  title: "Shipping & Assurance",
                  content:
                    "Dispatched within 1–2 business days with tracked Pan-India delivery (3–7 business days). Complimentary express shipping on orders above ₹999. Every garment undergoes manual atelier QC before sealing.",
                },
              ].map((sec) => {
                const open = expandedSection === sec.id;
                return (
                  <div key={sec.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedSection(open ? null : sec.id)}
                      className="w-full py-4 flex items-center justify-between text-left group"
                    >
                      <span className="font-mono-tech text-[11px] tracking-[0.24em] uppercase text-[#0D0D0D]">
                        {sec.title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#64625C] group-hover:text-[#0D0D0D] transition-transform duration-300 ${
                          open ? "rotate-180 text-[#0D0D0D]" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 font-body text-xs sm:text-sm text-[#64625C] leading-[1.85] whitespace-pre-line">
                            {sec.content}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div id="reviews">
          <Reviews productId={product.id} />
        </div>

        {/* Complete The Silhouette Recommendations */}
        {recommendedProducts.length > 0 && (
          <section className="mt-16 pt-14 border-t border-[#0D0D0D]/12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block mb-2">
                  Curated Pairings
                </span>
                <h2 className="font-display italic text-3xl sm:text-4xl font-normal text-[#0D0D0D]">
                  Complete The Silhouette
                </h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#0D0D0D] underline underline-offset-4 hover:opacity-70 transition-opacity"
              >
                <span>View Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {recommendedProducts.map((rec) => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Add-to-Bag Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#F6F5F1]/95 border-t border-[#0D0D0D]/12 px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-body text-xs text-[#0D0D0D] font-medium truncate">
            {product.title}
          </p>
          <p className="font-mono-tech text-[11px] text-[#64625C]">
            <span className="text-[#0D0D0D] font-medium">
              {formatCurrency(product.price)}
            </span>
            {selectedSize && <span> · {selectedSize.toUpperCase()}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canPurchase}
          className={`px-6 py-3 rounded-none font-mono-tech text-[10px] tracking-[0.22em] uppercase flex-shrink-0 transition-colors ${
            canPurchase
              ? "bg-[#0D0D0D] text-[#F6F5F1] hover:bg-[#262626]"
              : "bg-[#EAE8E2] text-[#64625C] cursor-not-allowed"
          }`}
        >
          {canPurchase ? "Add To Bag" : "Select Size"}
        </button>
      </div>

      {/* Full-Screen Noir Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[90] bg-[#0A0A0A]/96 flex items-center justify-center p-4 sm:p-10"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-11 h-11 rounded-none bg-[#141414] border border-[#F4F2ED]/20 flex items-center justify-center text-[#F4F2ED] hover:bg-[#F4F2ED] hover:text-[#0A0A0A] transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-none bg-[#141414] border border-[#F4F2ED]/20 flex items-center justify-center text-[#F4F2ED] hover:bg-[#F4F2ED] hover:text-[#0A0A0A] transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-none bg-[#141414] border border-[#F4F2ED]/20 flex items-center justify-center text-[#F4F2ED] hover:bg-[#F4F2ED] hover:text-[#0A0A0A] transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono-tech text-[11px] tracking-[0.26em] text-[#F4F2ED]/70">
                  {String(selectedImage + 1).padStart(2, "0")} /{" "}
                  {String(gallery.length).padStart(2, "0")}
                </div>
              </>
            )}

            <img
              src={gallery[selectedImage] || product.frontImage}
              alt={product.title}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[86vh] max-w-[90vw] object-contain rounded-none border border-[#F4F2ED]/15"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Studio Alabaster Size & Fit Guide Modal */}
      <AnimatePresence>
        {showSizeGuideModal && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuideModal(false)}
              className="fixed inset-0 bg-[#0A0A0A]/60"
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-2xl bg-[#F6F5F1] text-[#0D0D0D] border border-[#0D0D0D]/15 rounded-none overflow-hidden max-h-[88vh] flex flex-col"
            >
              <div className="px-6 py-5 bg-white border-b border-[#0D0D0D]/12 flex items-center justify-between">
                <div>
                  <span className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#64625C] block">
                    Atelier Fit Spec
                  </span>
                  <h3 className="font-display italic text-2xl text-[#0D0D0D] mt-0.5">
                    Size &amp; Fit Guide
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeGuideModal(false)}
                  aria-label="Close size guide"
                  className="w-9 h-9 rounded-none border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Oversized Fit Scale Bar */}
                <div className="p-4 bg-white border border-[#0D0D0D]/12">
                  <div className="flex justify-between font-mono-tech text-[9px] tracking-[0.22em] uppercase text-[#64625C] mb-3">
                    <span>Tailored</span>
                    <span>Regular</span>
                    <span className="text-[#0D0D0D] font-semibold">Oversized Boxy</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#EAE8E2] relative">
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-[#0D0D0D]" />
                  </div>
                  <p className="font-body text-xs text-[#64625C] mt-3.5 leading-relaxed">
                    Mystique silhouettes are cut intentionally oversized with dropped shoulders. Select your true size for the intended drape, or size down once for a closer profile.
                  </p>
                </div>

                {/* Measurements Table (Sanity sizeGuide OR Default Chart) */}
                <div className="overflow-x-auto bg-white border border-[#0D0D0D]/12">
                  {product.sizeGuide ? (
                    <table className="w-full text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#EAE8E2]">
                          {product.sizeGuide
                            .split("\n")[0]
                            ?.split(/\s{2,}|\t/)
                            .filter(Boolean)
                            .map((header, idx) => (
                              <th
                                key={idx}
                                className="px-4 py-3 text-left font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#0D0D0D] border-b border-[#0D0D0D]/12"
                              >
                                {header.trim()}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {product.sizeGuide
                          .split("\n")
                          .slice(1)
                          .filter((line) => line.trim())
                          .map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="border-b border-[#0D0D0D]/10 last:border-0 hover:bg-[#F6F5F1]"
                            >
                              {row
                                .split(/\s{2,}|\t/)
                                .filter(Boolean)
                                .map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`px-4 py-3 ${
                                      cIdx === 0
                                        ? "font-mono-tech font-semibold text-[#0D0D0D]"
                                        : "font-body text-[#64625C]"
                                    }`}
                                  >
                                    {cell.trim()}
                                  </td>
                                ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#EAE8E2]">
                          {["Size", "Chest", "Length", "Shoulder"].map((col) => (
                            <th
                              key={col}
                              className="px-4 py-3 text-left font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#0D0D0D] border-b border-[#0D0D0D]/12"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DEFAULT_SIZE_CHART.map((row) => (
                          <tr
                            key={row.size}
                            className="border-b border-[#0D0D0D]/10 last:border-0 hover:bg-[#F6F5F1]"
                          >
                            <td className="px-4 py-3 font-mono-tech font-semibold text-[#0D0D0D]">
                              {row.size}
                            </td>
                            <td className="px-4 py-3 font-body text-[#64625C]">
                              {row.chest}
                            </td>
                            <td className="px-4 py-3 font-body text-[#64625C]">
                              {row.length}
                            </td>
                            <td className="px-4 py-3 font-body text-[#64625C]">
                              {row.shoulder}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
