"use client";

import React from "react";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

const Wishlist = () => {
  const { wishlist } = useWishlist();  // Assuming wishlist is an array of product objects

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Wishlist</h1>
      
      {/* Display wishlist items */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-xl text-gray-400">Your wishlist is empty.</p>
      )}
    </div>
  );
};

export default Wishlist;
