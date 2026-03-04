"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Create the CartContext
const CartContext = createContext();

// Custom hook to use the CartContext
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      // Create unique identifier combining variantId, size, and color
      const uniqueId = `${product.variantId}-${product.size}-${product.color}`;
      const existingItem = prevCart.find((item) => {
        const itemUniqueId = `${item.variantId}-${item.size}-${item.color}`;
        return itemUniqueId === uniqueId;
      });
      
      if (existingItem) {
        return prevCart.map((item) => {
          const itemUniqueId = `${item.variantId}-${item.size}-${item.color}`;
          return itemUniqueId === uniqueId
            ? { ...item, quantity: item.quantity + product.quantity }
            : item;
        });
      } else {
        return [...prevCart, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };
  
  const removeFromCart = (variantId, size, color) => {
    setCart((prevCart) => {
      // If size and color provided, remove specific variant
      if (size && color) {
        return prevCart.filter((item) => {
          const itemUniqueId = `${item.variantId}-${item.size}-${item.color}`;
          const targetUniqueId = `${variantId}-${size}-${color}`;
          return itemUniqueId !== targetUniqueId;
        });
      }
      // Otherwise remove by variantId only (backward compatibility)
      return prevCart.filter((item) => item.variantId !== variantId);
    });
  };
  
  const updateQuantity = (variantId, newQuantity, size, color) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        // If size and color provided, match specific variant
        if (size && color) {
          const itemUniqueId = `${item.variantId}-${item.size}-${item.color}`;
          const targetUniqueId = `${variantId}-${size}-${color}`;
          return itemUniqueId === targetUniqueId ? { ...item, quantity: newQuantity } : item;
        }
        // Otherwise match by variantId only (backward compatibility)
        return item.variantId === variantId ? { ...item, quantity: newQuantity } : item;
      })
    );
  };
  

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};