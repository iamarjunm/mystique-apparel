"use client";

import React, { useState, useEffect } from "react";
import ProductGrid from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/fetchProducts";
import formatCurrency from "@/lib/formatCurrency";
import Newsletter from "@/components/Newsletter";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 2000], // ₹500 - ₹2000 Range
    discount: 0,
  });

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    };
    loadProducts();
  }, []);

  // Sorting Logic
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "price-low-high") return a.price - b.price;
    if (sortOption === "price-high-low") return b.price - a.price;
    if (sortOption === "discount") return b.discountPercentage - a.discountPercentage;
    return 0;
  });

  // Filtering Logic
  const filteredProducts = sortedProducts.filter((product) => {
    return (
      (filters.category ? product.category === filters.category : true) &&
      product.price >= filters.priceRange[0] &&
      product.price <= filters.priceRange[1] &&
      product.discountPercentage >= filters.discount
    );
  });

  return (
    <div className="container mx-auto px-6 py-16">
      {/* Header */}
      <h1 className="text-6xl font-extrabold uppercase tracking-wide text-white mb-10 text-center">
        The Collection
      </h1>

      {/* Sorting & Filters Section */}
      <div className="flex flex-wrap justify-between items-center mb-12 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-[0px_0px_20px_rgba(255,255,255,0.15)] border border-white/20">
        {/* Sort Dropdown */}
        <div className="relative w-full md:w-auto mb-4 md:mb-0">
          <select
            className="bg-black text-white px-6 py-3 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all w-full md:w-auto"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="discount">Best Discounts</option>
          </select>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-end w-full md:w-auto">

          {/* Price Range Filter */}
          <div className="flex flex-col items-center">
            <input
              type="range"
              min="500"
              max="2000"
              step="50"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters({ ...filters, priceRange: [500, parseInt(e.target.value)] })}
              className="w-48 accent-white"
            />
            <span className="text-white text-sm mt-2">
              Up to {formatCurrency(filters.priceRange[1])}
            </span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} />
      <Newsletter />
    </div>
  );
};

export default Shop;
