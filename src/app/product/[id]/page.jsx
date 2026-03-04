"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProductById, fetchProducts } from "@/lib/fetchProducts";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/Toast";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColorSlug, setSelectedColorSlug] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [availableStock, setAvailableStock] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart } = useCart();

  useEffect(() => {
    const getProduct = async () => {
      try {
        const data = await fetchProductById(id);
  
        if (!data) {
          console.error("Product data is null");
          return;
        }
  
        setProduct(data);
  
        // Set initial color if available
        if (data.availableColors && data.availableColors.length > 0) {
          const firstColorSlug = data.availableColors[0].slug || data.availableColors[0].id;
          setSelectedColorSlug(firstColorSlug);
        }
  
        const allProducts = await fetchProducts();
        const randomProducts = allProducts
          .filter((p) => p.id !== data.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        setRecommendedProducts(randomProducts);
  
        setIsWishlisted(isInWishlist(data.id));
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    getProduct();
  }, [id, isInWishlist]);

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.title,
          text: `Check out this product: ${product.title}`,
          url: window.location.href,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link copied to clipboard!");
      });
    }
  };

  const getColorVariant = (colorSlug) => {
    if (!product || !product.variants || !colorSlug) {
      return null;
    }
    
    return product.variants.find(
      v => v.color?.slug === colorSlug || v.color?.id === colorSlug
    );
  };

  const updateAvailableStock = (size, colorSlug) => {
    if (!size || !colorSlug || !product) {
      setAvailableStock(0);
      return;
    }
    
    const variant = getColorVariant(colorSlug);
    const stock = variant?.sizeStock?.[size] || 0;
    setAvailableStock(stock);
  };

  const handleSizeSelection = (size) => {
    setSelectedSize(size);
    updateAvailableStock(size, selectedColorSlug);
  };

  const handleColorSelection = (color) => {
    const colorSlug = color.slug || color.id;
    setSelectedColorSlug(colorSlug);
    
    const newVariant = product.variants.find(
      v => v.color?.slug === colorSlug || v.color?.id === colorSlug
    );
    
    setSelectedSize(null);
    setAvailableStock(0);
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      if (quantity < availableStock) {
        setQuantity(quantity + 1);
      } else {
        alert(`Only ${availableStock} items available in stock.`);
      }
    } else if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size before adding to cart.");
      return;
    }

    if (!selectedColorSlug) {
      alert("Please select a color before adding to cart.");
      return;
    }
  
    if (availableStock <= 0) {
      alert("This size/color combination is out of stock.");
      return;
    }
  
    const variant = getColorVariant(selectedColorSlug);

    if (!variant) {
      alert("Selected variant not found.");
      return;
    }
  
    // Add the product to the cart
    addToCart({
      id: product.id,
      variantId: variant.id,
      productId: product.id, // Store the actual Sanity product document ID
      title: product.title,
      price: parseFloat(product.price),
      image: product.images[0] || product.frontImage,
      size: selectedSize,
      color: selectedColorSlug,
      quantity: quantity,
      productHandle: product.slug,
      stock: availableStock, // Pass stock info to cart
    });

    setToastMessage("Product added to cart!");
    setShowToast(true);
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      alert("Please select a size before proceeding.");
      return;
    }

    if (!selectedColorSlug) {
      alert("Please select a color before proceeding.");
      return;
    }

    if (availableStock <= 0) {
      alert("This size/color combination is out of stock.");
      return;
    }

    try {
      const variant = getColorVariant(selectedColorSlug);

      if (!variant) {
        alert("Selected variant not found.");
        return;
      }
  
      // Add the current item to cart with quantity (or update if already exists)
      addToCart({
        id: product.id,
        variantId: variant.id,
        productId: product.id, // Store the actual Sanity product document ID
        title: product.title,
        price: parseFloat(product.price),
        image: product.images[0] || product.frontImage,
        size: selectedSize,
        color: selectedColorSlug,
        quantity: quantity,
        productHandle: product.slug,
      });
  
      // Redirect to checkout
      router.push('/checkout');
  
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Failed to proceed to checkout. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white py-5 sm:py-7 md:py-8">
      <div className="container mx-auto px-4 sm:px-5 md:px-6">
        {/* Toast Notification */}
        {showToast && (
          <Toast
            message={toastMessage}
            duration={3000}
            onClose={() => setShowToast(false)}
          />
        )}

        {/* Size Guide Modal */}
        {showSizeGuideModal && product.sizeGuide && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-gray-700 px-5 sm:px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Size Guide</h3>
                <button
                  onClick={() => setShowSizeGuideModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5 sm:p-6 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      {product.sizeGuide.split('\n')[0]?.split(/\s{2,}|\t/).filter(Boolean).map((header, idx) => (
                        <th key={idx} className="px-3 sm:px-4 py-3 text-left font-semibold text-white border-b-2 border-gray-700 bg-gray-800/50">
                          {header.trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizeGuide.split('\n').slice(1).filter(line => line.trim()).map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
                        {row.split(/\s{2,}|\t/).filter(Boolean).map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-3 sm:px-4 py-3 text-gray-300">
                            {cell.trim()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="mb-3 sm:mb-4">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-gray-500">Mystique Apparel</p>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-200 mt-1">Product Details</h2>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-7 lg:gap-8 mb-8 sm:mb-10 md:mb-12">
          {/* Product Images */}
          <div className="relative lg:col-span-6">
            {/* Main Product Image */}
            <div className="relative group rounded-xl overflow-hidden">
              {/* Wishlist Icon */}
              <button
                onClick={handleWishlist}
                className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 p-1.5 sm:p-2 bg-black/60 border border-gray-700/60 rounded-full hover:bg-black/80 transition-all duration-300 backdrop-blur"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isWishlisted ? "text-pink-500 fill-current" : "text-white fill-none"}`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              <img
                src={product.images[selectedImage] || product.frontImage}
                alt={product.title}
                className="block w-full h-auto max-h-[540px] object-contain transform transition-transform duration-700 ease-in-out group-hover:scale-[1.02]"
              />
            </div>

            {/* Additional Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`Product Image ${index + 1}`}
                      className={`w-full h-[52px] sm:h-[70px] md:h-[82px] object-cover rounded-md border transform transition-transform duration-300 ease-in-out group-hover:scale-105 ${
                        selectedImage === index ? "border-white shadow-lg shadow-white/20" : "border-gray-700/70"
                      }`}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-start lg:col-span-6 bg-transparent rounded-xl p-3 sm:p-4 md:p-5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2.5 sm:mb-3 font-serif tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Price Section */}
            <div className="mb-3 sm:mb-4">
              {product.originalPrice && (
                <>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Rs {parseFloat(product.price).toFixed(2)}{" "}
                    <span className="text-xs sm:text-sm md:text-base text-red-400/90 line-through ml-1 sm:ml-1.5">
                      Rs {product.originalPrice.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-400 font-semibold mt-1">
                    {product.discountPercentage}% off
                  </p>
                </>
              )}
              {!product.originalPrice && (
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Rs {parseFloat(product.price).toFixed(2)}
                </p>
              )}
            </div>

            {/* Color Selection */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <h2 className="text-xs sm:text-sm font-bold text-white mb-2">Select Color</h2>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color, index) => {
                    const colorSlug = color.slug || color.id;
                    const colorName = color.name || `Color ${index + 1}`;
                    
                    return (
                      <button
                        key={`color-${colorSlug}-${index}`}
                        onClick={() => handleColorSelection(color)}
                        className={`relative px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-300 border ${
                          selectedColorSlug === colorSlug
                            ? "border-white scale-105 shadow-lg"
                            : "border-gray-700 hover:border-gray-500"
                        }`}
                        style={{ 
                          backgroundColor: color.hexCode,
                          color: parseInt(color.hexCode.slice(1), 16) > 0xffffff/2 ? '#000' : '#fff'
                        }}
                        title={colorName}
                      >
                        {colorName}
                        {selectedColorSlug === colorSlug && (
                          <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] px-1.5 py-0.5 rounded-full">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs sm:text-sm font-bold text-white">Select Size</h2>
                {product.sizeGuide && (
                  <button
                    onClick={() => setShowSizeGuideModal(true)}
                    className="text-xs text-gray-400 hover:text-white underline transition-colors"
                  >
                    Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.availableSizes || ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl']).map((size) => {
                  const variant = getColorVariant(selectedColorSlug);
                  const sizeStock = variant?.sizeStock?.[size] || 0;
                  const isAvailable = sizeStock > 0;
                  
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeSelection(size)}
                      disabled={!isAvailable}
                      className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-300 relative uppercase border ${
                        selectedSize === size
                          ? "bg-white text-black border-white transform scale-105"
                          : isAvailable
                          ? "bg-gray-900 text-white border-gray-700 hover:bg-gray-800 hover:scale-105"
                          : "bg-gray-900 text-gray-500 border-gray-800 cursor-not-allowed"
                      }`}
                    >
                      {size}
                      {isAvailable && sizeStock > 0 && sizeStock <= 5 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {sizeStock}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Status */}
            {selectedSize && selectedColorSlug && (
              <div className="mb-3 sm:mb-4">
                {availableStock > 0 ? (
                  <p className={`text-xs sm:text-sm font-medium ${availableStock <= 5 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {availableStock <= 5 ? `⚠️ Only ${availableStock} left in stock!` : '✅ In Stock'}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm font-medium text-red-500">❌ Out of Stock</p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-bold text-white mb-2">Quantity</h2>
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 border border-gray-700 text-white rounded-full hover:bg-gray-800 transition-all duration-300 font-bold text-xs"
                >
                  −
                </button>
                <span className="text-xs sm:text-sm font-bold w-7 sm:w-8 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 border border-gray-700 text-white rounded-full hover:bg-gray-800 transition-all duration-300 font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 mb-3 sm:mb-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColorSlug || availableStock <= 0}
                className={`w-full py-2 sm:py-2.5 px-3.5 sm:px-4.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-300 transform ${
                  selectedSize && selectedColorSlug && availableStock > 0
                    ? "bg-gradient-to-r from-zinc-100 to-zinc-200 text-zinc-900 hover:from-zinc-50 hover:to-zinc-150 hover:scale-[1.02] shadow-lg shadow-zinc-900/20"
                    : "bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!selectedSize || !selectedColorSlug || availableStock <= 0}
                className={`w-full py-2 sm:py-2.5 px-3.5 sm:px-4.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-300 transform ${
                  selectedSize && selectedColorSlug && availableStock > 0
                    ? "bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 text-white border border-neutral-600/70 hover:from-neutral-700 hover:via-neutral-600 hover:to-neutral-700 hover:scale-[1.02] shadow-lg shadow-black/40"
                    : "bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                Buy Now
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M15 8a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M12.935 16.39a6.002 6.002 0 00-11.712-3.584c-1.113.89-1.773 2.165-1.773 3.584a2 2 0 104 0c0-.664.168-1.292.47-1.834a6.002 6.002 0 018.15 8.615l-.757-.757a1 1 0 00-1.414 1.414l2.121 2.121a1 1 0 001.414 0l2.121-2.121a1 1 0 00-1.414-1.414l-.757.757z" />
              </svg>
              Share
            </button>

            {/* Product Information Accordions */}
            <div className="mt-5 sm:mt-6 divide-y divide-white/10">
              {/* About Section */}
              {product.description && (
                <div className="py-1">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
                    className="w-full px-0 py-3 sm:py-3.5 flex items-center justify-between transition-colors"
                  >
                    <span className="text-sm sm:text-base font-semibold text-zinc-100 uppercase tracking-[0.12em]">About</span>
                    <svg
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                        expandedSection === 'about' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  {expandedSection === 'about' && (
                    <div className="pb-3.5 sm:pb-4.5">
                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Care Instructions Section */}
              {product.careInstructions && (
                <div className="py-1">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'care' ? null : 'care')}
                    className="w-full px-0 py-3 sm:py-3.5 flex items-center justify-between transition-colors"
                  >
                    <span className="text-sm sm:text-base font-semibold text-zinc-100 uppercase tracking-[0.12em]">Care Instructions</span>
                    <svg
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                        expandedSection === 'care' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  {expandedSection === 'care' && (
                    <div className="pb-3.5 sm:pb-4.5">
                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-line">{product.careInstructions}</p>
                    </div>
                  )}
                </div>
              )}



              {/* Delivery & Assurance Section */}
              <div className="py-1">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'delivery' ? null : 'delivery')}
                  className="w-full px-0 py-3 sm:py-3.5 flex items-center justify-between transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-zinc-100 uppercase tracking-[0.12em]">Delivery & Assurance</span>
                  <svg
                    className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                      expandedSection === 'delivery' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {expandedSection === 'delivery' && (
                  <div className="pb-3.5 sm:pb-4.5 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100 mb-1">Shipping</p>
                      <p className="text-sm sm:text-base text-zinc-400">5-7 business days</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100 mb-1">Quality Assurance</p>
                      <p className="text-sm sm:text-base text-zinc-400">Every piece is quality checked before dispatch</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recommended Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
