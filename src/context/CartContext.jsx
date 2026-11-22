"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isHydrated = useRef(false);

  // Load cart safely from localStorage on initial render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error("[CART] Failed to parse stored cart:", error);
    } finally {
      isHydrated.current = true;
    }
  }, []);

  // Save cart to localStorage only after hydration
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("[CART] Failed to persist cart:", error);
    }
  }, [cart]);

  // Global keyboard shortcut Cmd/Ctrl + K for Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCartOpen(false);
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsCartOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openCart = useCallback(() => {
    setIsSearchOpen(false);
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => {
    setIsSearchOpen(false);
    setIsCartOpen((prev) => !prev);
  }, []);

  const openSearch = useCallback(() => {
    setIsCartOpen(false);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const addToCart = useCallback((product, options = { openDrawer: true }) => {
    const qtyToAdd = Number(product.quantity) || 1;
    setCart((prevCart) => {
      const uniqueId = `${product.variantId}-${product.size}-${product.color}`;
      const existingItem = prevCart.find(
        (item) => `${item.variantId}-${item.size}-${item.color}` === uniqueId
      );

      if (existingItem) {
        const maxStock = product.stock || existingItem.stock || 999;
        return prevCart.map((item) => {
          const itemUniqueId = `${item.variantId}-${item.size}-${item.color}`;
          if (itemUniqueId !== uniqueId) return item;
          const nextQty = Math.min(item.quantity + qtyToAdd, maxStock);
          return { ...item, quantity: nextQty, stock: maxStock };
        });
      }
      return [...prevCart, { ...product, quantity: qtyToAdd }];
    });

    if (options?.openDrawer !== false) {
      setIsSearchOpen(false);
      setIsCartOpen(true);
    }
  }, []);

  const removeFromCart = useCallback((variantId, size, color) => {
    setCart((prevCart) => {
      if (size && color) {
        const targetUniqueId = `${variantId}-${size}-${color}`;
        return prevCart.filter(
          (item) => `${item.variantId}-${item.size}-${item.color}` !== targetUniqueId
        );
      }
      return prevCart.filter((item) => item.variantId !== variantId);
    });
  }, []);

  const updateQuantity = useCallback((variantId, newQuantity, size, color) => {
    if (newQuantity <= 0) {
      removeFromCart(variantId, size, color);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (size && color) {
          const itemUniqueId = `${item.variantId}-${item.size}-${item.color}`;
          const targetUniqueId = `${variantId}-${size}-${color}`;
          return itemUniqueId === targetUniqueId ? { ...item, quantity: newQuantity } : item;
        }
        return item.variantId === variantId ? { ...item, quantity: newQuantity } : item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        isSearchOpen,
        openSearch,
        closeSearch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
