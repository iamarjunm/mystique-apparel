"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/fetchProducts";
import formatCurrency from "@/lib/formatCurrency";
import Newsletter from "@/components/Newsletter";

const Shop = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    discount: 0,
    inStock: false,
    onSale: false,
    featured: false,
    newArrival: false,
    bestseller: false,
    sizes: [],
    colors: [],
    category: "",
    collection: "",
  });
  const [loading, setLoading] = useState(true);

  // Handle URL parameters on mount
  useEffect(() => {
    const category = searchParams.get("category");
    const collection = searchParams.get("collection");
    
    if (category || collection) {
      setFilters((prev) => ({
        ...prev,
        category: category || "",
        collection: collection || "",
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts || []);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 5000 };
    const prices = products.map((p) => Number(p.price) || 0);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return { min, max: max <= min ? min + 100 : max };
  }, [products]);

  useEffect(() => {
    if (!products.length) return;
    setFilters((prev) => ({
      ...prev,
      priceRange: [priceBounds.min, priceBounds.max],
    }));
  }, [products, priceBounds.min, priceBounds.max]);

  const sizeOptions = useMemo(() => {
    const all = products.flatMap((p) => p.availableSizes || []).filter(Boolean);
    return [...new Set(all)];
  }, [products]);

  const colorOptions = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      (p.availableColors || []).forEach((color) => {
        const key = color.slug || color.id || color.name;
        if (key && !map.has(key)) {
          map.set(key, {
            key,
            name: color.name || "Color",
            hexCode: color.hexCode || "#999999",
          });
        }
      });
    });
    return Array.from(map.values());
  }, [products]);

  const toggleFilterValue = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortOption("featured");
    setFilters({
      priceRange: [priceBounds.min, priceBounds.max],
      discount: 0,
      inStock: false,
      onSale: false,
      featured: false,
      newArrival: false,
      bestseller: false,
      sizes: [],
      colors: [],
      category: "",
      collection: "",
    });
  };

  const processedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const title = String(product.title || "").toLowerCase();
      const searchCheck = !searchQuery || title.includes(searchQuery.toLowerCase());

      const price = Number(product.price) || 0;
      const priceCheck = price >= filters.priceRange[0] && price <= filters.priceRange[1];

      const discountCheck = (product.discountPercentage || 0) >= filters.discount;
      const stockCheck = !filters.inStock || (product.totalStock || 0) > 0;
      const saleCheck = !filters.onSale || (product.discountPercentage || 0) > 0;
      const featuredCheck = !filters.featured || !!product.featured;
      const arrivalCheck = !filters.newArrival || !!product.newArrival;
      const bestsellerCheck = !filters.bestseller || !!product.bestseller;

      const sizeCheck =
        filters.sizes.length === 0 ||
        filters.sizes.some((size) =>
          (product.sizes || []).some((s) => s.size === size && s.stock > 0)
        );

      const colorCheck =
        filters.colors.length === 0 ||
        (product.availableColors || []).some((c) =>
          filters.colors.includes(c.slug || c.id || c.name)
        );

      // Category filter
      const categoryCheck =
        !filters.category ||
        String(product.category || "").toLowerCase() === filters.category.toLowerCase();

      // Collection filter
      const collectionCheck =
        !filters.collection ||
        String(product.collection || "").toLowerCase() === filters.collection.toLowerCase();

      return (
        searchCheck &&
        priceCheck &&
        discountCheck &&
        stockCheck &&
        saleCheck &&
        featuredCheck &&
        arrivalCheck &&
        bestsellerCheck &&
        sizeCheck &&
        colorCheck &&
        categoryCheck &&
        collectionCheck
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortOption === "featured") return Number(b.featured) - Number(a.featured);
      if (sortOption === "newest") return Number(b.newArrival) - Number(a.newArrival);
      if (sortOption === "bestseller") return Number(b.bestseller) - Number(a.bestseller);
      if (sortOption === "price-low-high") return (a.price || 0) - (b.price || 0);
      if (sortOption === "price-high-low") return (b.price || 0) - (a.price || 0);
      if (sortOption === "discount-high-low") return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      if (sortOption === "discount-low-high") return (a.discountPercentage || 0) - (b.discountPercentage || 0);
      if (sortOption === "stock-high-low") return (b.totalStock || 0) - (a.totalStock || 0);
      if (sortOption === "name-a-z") return String(a.title || "").localeCompare(String(b.title || ""));
      if (sortOption === "name-z-a") return String(b.title || "").localeCompare(String(a.title || ""));
      return 0;
    });

    return sorted;
  }, [products, searchQuery, filters, sortOption]);

  const activeFilterCount =
    Number(Boolean(searchQuery)) +
    Number(filters.inStock) +
    Number(filters.onSale) +
    Number(filters.featured) +
    Number(filters.newArrival) +
    Number(filters.bestseller) +
    Number(filters.discount > 0) +
    Number(filters.priceRange[0] > priceBounds.min || filters.priceRange[1] < priceBounds.max) +
    filters.sizes.length +
    filters.colors.length +
    Number(Boolean(filters.category)) +
    Number(Boolean(filters.collection));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-[0.18em] text-white mb-4 sm:mb-6 text-center">
          The Collection
        </h1>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name"
            className="flex-1 bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-xs sm:text-sm"
          />
          <select
            className="bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="bestseller">Bestseller</option>
            <option value="price-low-high">Price: Low-High</option>
            <option value="price-high-low">Price: High-Low</option>
            <option value="discount-high-low">Discount ↓</option>
            <option value="discount-low-high">Discount ↑</option>
            <option value="stock-high-low">Stock ↓</option>
            <option value="name-a-z">A-Z</option>
            <option value="name-z-a">Z-A</option>
          </select>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {/* Sidebar */}
          <div
            className={`${
              sidebarOpen ? "block" : "hidden"
            } lg:block lg:col-span-1 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-5 max-h-fit sticky top-4`}
          >
            <div>
              <h3 className="text-xs sm:text-sm uppercase tracking-[0.15em] text-gray-400 font-semibold mb-3 sm:mb-4">Filters</h3>

              {/* Price Filter */}
              <div className="space-y-2 sm:space-y-2.5">
                <p className="text-xs sm:text-xs uppercase tracking-[0.12em] text-gray-500">Price Range</p>
                <div className="space-y-2">
                  <div>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step="50"
                      value={filters.priceRange[0]}
                      onChange={(e) => {
                        const min = Number(e.target.value);
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: [Math.min(min, prev.priceRange[1]), prev.priceRange[1]],
                        }));
                      }}
                      className="w-full accent-white cursor-pointer"
                    />
                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">{formatCurrency(filters.priceRange[0])}</p>
                  </div>
                  <div>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step="50"
                      value={filters.priceRange[1]}
                      onChange={(e) => {
                        const max = Number(e.target.value);
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], Math.max(max, prev.priceRange[0])],
                        }));
                      }}
                      className="w-full accent-white cursor-pointer"
                    />
                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">{formatCurrency(filters.priceRange[1])}</p>
                  </div>
                </div>
              </div>

              {/* Discount Filter */}
              <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t border-gray-700/50">
                <p className="text-xs sm:text-xs uppercase tracking-[0.12em] text-gray-500">Min Discount</p>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={filters.discount}
                  onChange={(e) => setFilters((prev) => ({ ...prev, discount: Number(e.target.value) }))}
                  className="w-full accent-white cursor-pointer"
                />
                <p className="text-[10px] sm:text-[11px] text-gray-400">{filters.discount}% off</p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t border-gray-700/50">
                {[
                  ["inStock", "In Stock"],
                  ["onSale", "On Sale"],
                  ["featured", "Featured"],
                  ["newArrival", "New Arrival"],
                  ["bestseller", "Bestseller"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs sm:text-xs text-gray-300 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={filters[key]}
                      onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-white rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Sizes */}
              {sizeOptions.length > 0 && (
                <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t border-gray-700/50">
                  <p className="text-xs sm:text-xs uppercase tracking-[0.12em] text-gray-500">Sizes</p>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleFilterValue("sizes", size)}
                        className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] uppercase border transition-all ${
                          filters.sizes.includes(size)
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-gray-400 border-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {colorOptions.length > 0 && (
                <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t border-gray-700/50">
                  <p className="text-xs sm:text-xs uppercase tracking-[0.12em] text-gray-500">Colors</p>
                  <div className="space-y-1 sm:space-y-1.5">
                    {colorOptions.map((color) => (
                      <button
                        key={color.key}
                        onClick={() => toggleFilterValue("colors", color.key)}
                        className={`w-full flex items-center gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded text-[10px] sm:text-[11px] border transition-all text-left ${
                          filters.colors.includes(color.key)
                            ? "border-white text-white bg-white/10"
                            : "border-gray-600 text-gray-400 hover:border-gray-400"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.hexCode }} />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Button */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-4 sm:mt-5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-xs uppercase tracking-[0.12em] rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Clear All ({activeFilterCount})
                </button>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
              {loading ? "Loading..." : `${processedProducts.length} products`}
            </p>

            {loading ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-gray-400 text-sm sm:text-base animate-pulse">Loading products...</p>
              </div>
            ) : processedProducts.length > 0 ? (
              <ProductGrid products={processedProducts} />
            ) : (
              <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-900/50 to-black border border-gray-700/50 rounded-xl p-4 sm:p-6">
                <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">No products match your filters.</p>
                <button
                  onClick={clearFilters}
                  className="px-3 sm:px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors text-xs sm:text-sm"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Newsletter />
    </div>
  );
};

export default Shop;
