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
  const [quantity, setQuantity] = useState(1);
  const [sizes, setSizes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart } = useCart();

  useEffect(() => {
    const getProduct = async () => {
      try {
        const shopifyId = `gid://shopify/Product/${id}`;
        const data = await fetchProductById(shopifyId);
  
        if (!data) {
          console.error("Product data is null");
          return;
        }
  
        setProduct(data);
  
        // Log the product data
        console.log("Product data:", data);
  
        if (data.sizes) {
          setSizes(data.sizes);
        }
  
        const allProducts = await fetchProducts();
        const randomProducts = allProducts
          .filter((p) => p.id !== shopifyId)
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

  const handleBuyNow = async () => {
    if (!selectedSize) {
      alert("Please select a size before proceeding.");
      return;
    }
  
    try {
      // Find the matching variant by selected size
      const selectedVariant = product.variants.find(
        variant => variant.title === selectedSize || variant.size === selectedSize
      );
  
      if (!selectedVariant) {
        alert("Selected variant not found.");
        return;
      }
  
      // Extract just the numeric ID from the variant ID
      const variantId = selectedVariant.id.split('/').pop();
  
      // Clear any existing items in cart
      removeFromCart(selectedVariant.id);
      
      // Add the current item to cart with quantity
      addToCart({
        id: product.id,
        variantId: selectedVariant.id, // Keep the full variant ID for your cart context
        title: product.title,
        price: parseFloat(product.price),
        image: product.images[0],
        size: selectedSize,
        quantity: quantity,
        productHandle: product.handle,
      });
  
      // Redirect to your Next.js checkout page
      router.push('/checkout');
      
      // Alternative if you want to use Shopify's native checkout:
      // const checkoutUrl = `${process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL}/cart/${variantId}:${quantity}`;
      // window.location.href = checkoutUrl;
  
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Failed to proceed to checkout. Please try again.");
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size before adding to cart.");
      return;
    }
  
    // Find the matching variant by selected size
    const selectedVariant = product.variants.find(
      (variant) => variant.title === selectedSize || variant.size === selectedSize
    );
  
    if (!selectedVariant) {
      alert("Selected variant not found.");
      return;
    }
  
    // Add the product to the cart
    addToCart({
      id: product.id,
      variantId: selectedVariant.id, // ✅ Include variant ID
      title: product.title,
      price: parseFloat(product.price),
      image: product.images[0],
      size: selectedSize,
      quantity: quantity,
      productHandle: product.handle,
    });

    console.log("Adding to cart:", {
      id: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      price: parseFloat(product.price),
      image: product.images[0],
      size: selectedSize,
      quantity: quantity,
    });
    
  
    // Show toast notification
    setShowToast(true);
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

  const handleSizeSelection = (size) => {
    if (sizes.find((s) => s.size === size)?.available) {
      setSelectedSize(size);
    }
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity(quantity + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4">
        {/* Toast Notification */}
        {showToast && (
          <Toast
            message="Product added to cart!"
            duration={3000}
            onClose={() => setShowToast(false)}
          />
        )}

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="relative">
            {/* Main Product Image */}
            <div className="relative group">
              {/* Wishlist Icon */}
              <button
                onClick={handleWishlist}
                className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 ${isWishlisted ? "text-pink-500 fill-current" : "text-white fill-none"}`}
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
                src={product.images[selectedImage] || "https://picsum.photos/800/800"}
                alt={product.title}
                className="w-full h-auto max-h-[650px] object-cover rounded-xl transform transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Hover Effect */}
              <div className="absolute inset-0 border border-white/10 rounded-xl transition-all duration-500" />
            </div>

            {/* Additional Images */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image || "https://picsum.photos/400/400"}
                    alt={`Product Image ${index + 1}`}
                    className={`w-full h-[120px] md:h-[150px] object-cover rounded-lg shadow-sm transform transition-transform duration-300 ease-in-out group-hover:scale-105 ${
                      selectedImage === index ? "border-2 border-white" : ""
                    }`}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-white mb-4 font-serif tracking-tight">
              {product.title}
            </h1>
            <p
              className="text-sm text-gray-400 mb-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Price Section */}
            <div className="mb-6">
              {product.originalPrice && (
                <>
                  <p className="text-3xl font-bold text-white">
                    Rs {parseFloat(product.price).toFixed(2)}{" "}
                    <span className="text-xl text-red-500 line-through">
                      Rs {product.originalPrice}
                    </span>
                  </p>
                  <p className="text-sm text-red-500">
                    {product.discountPercentage}% off
                  </p>
                </>
              )}
              {!product.originalPrice && (
                <p className="text-3xl font-bold text-white">
                  Rs {parseFloat(product.price).toFixed(2)}
                </p>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Select Size</h2>
              <div className="flex flex-wrap gap-3">
                {sizes.map((sizeInfo) => (
                  <button
                    key={sizeInfo.size}
                    onClick={() => handleSizeSelection(sizeInfo.size)}
                    disabled={!sizeInfo.available}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 relative ${
                      selectedSize === sizeInfo.size
                        ? "bg-white text-black transform scale-105"
                        : sizeInfo.available
                        ? "bg-gray-800 text-white hover:bg-gray-700 hover:scale-105"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed line-through"
                    }`}
                  >
                    {sizeInfo.size}
                    {sizeInfo.available && sizeInfo.stock > 0 && sizeInfo.stock <= 5 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {sizeInfo.stock} left
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Quantity</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-all duration-300"
                >
                  -
                </button>
                <span className="text-lg font-bold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-all duration-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart and Buy Now Buttons */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`w-full md:w-auto py-3 px-6 rounded-full text-lg font-semibold transition-all duration-300 transform ${
                  selectedSize
                    ? "bg-white text-black hover:bg-gray-200 hover:scale-105"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!selectedSize}
                className={`w-full md:w-auto py-3 px-6 rounded-full text-lg font-semibold transition-all duration-300 transform ${
                  selectedSize
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                Buy Now
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-fit px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-white mb-6 font-serif tracking-tight">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} size="small" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}