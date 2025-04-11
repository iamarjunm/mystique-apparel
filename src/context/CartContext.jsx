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
      const existingItem = prevCart.find((item) => item.variantId === product.variantId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.variantId === product.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };
  
  const removeFromCart = (variantId) => {
    setCart((prevCart) => prevCart.filter((item) => item.variantId !== variantId));
  };
  
  const updateQuantity = (variantId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.variantId === variantId ? { ...item, quantity: newQuantity } : item
      )
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