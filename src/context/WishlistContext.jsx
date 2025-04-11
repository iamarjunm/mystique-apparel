"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Create the WishlistContext
const WishlistContext = createContext();

// Custom hook to use the WishlistContext
export const useWishlist = () => useContext(WishlistContext);

// WishlistProvider component
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    const storedWishlist = localStorage.getItem("wishlist");
    if (storedWishlist) {
      const parsedWishlist = JSON.parse(storedWishlist);
      console.log("Loaded wishlist from localStorage:", parsedWishlist); // Debugging log
      setWishlist(parsedWishlist);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    console.log("Wishlist updated:", wishlist); // Debugging log
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Add a product to the wishlist
  const addToWishlist = (product) => {
    if (!wishlist.some((item) => item.id === product.id)) {
      setWishlist((prevWishlist) => [...prevWishlist, product]);
    }
  };

  // Remove a product from the wishlist
  const removeFromWishlist = (productId) => {
    setWishlist((prevWishlist) =>
      prevWishlist.filter((item) => item.id !== productId)
    );
  };

  // Check if a product is in the wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
