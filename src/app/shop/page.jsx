"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  Grid3X3,
  RotateCcw,
} from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/fetchProducts";
import formatCurrency from "@/lib/formatCurrency";
import Newsletter from "@/components/Newsletter";

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState(4);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
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

  // Sync URL query params cleanly
  useEffect(() => {
    const category = searchParams.get("category") || "";
    const collection = searchParams.get("collection") || "";
    const newArrival = searchParams.get("newArrival") === "true";
    const bestseller = searchParams.get("bestseller") === "true";
    const featured = searchParams.get("featured") === "true";
    const onSale = searchParams.get("onSale") === "true";
    const q = searchParams.get("q") || "";

    setSearchQuery(q);

    setFilters((prev) => ({
      ...prev,
      category,
      collection,
      newArrival,
      bestseller,
      featured,
      onSale,
    }));
  }, [searchParams]);

  // Lock body scroll when filter drawer is open
  useEffect(() => {
    if (filterDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterDrawerOpen]);

  // Close drawer on Escape
  useEffect(() => {
    if (!filterDrawerOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setFilterDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filterDrawerOpen]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts || []);
      } catch (err) {
        console.error("[SHOP] Error loading products:", err);
      } finally {
        setLoading(false);
      }
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
  }, [products.length, priceBounds.min, priceBounds.max]);

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
            hexCode: color.hexCode || "#0D0D0D",
          });
        }
      });
    });
    return Array.from(map.values());
  }, [products]);

  const categoryOptions = useMemo(() => {
    const all = products.map((p) => p.category).filter(Boolean);
    return [...new Set(all)];
  }, [products]);

  const collectionOptions = useMemo(() => {
    const all = products.map((p) => p.collection).filter(Boolean);
    return [...new Set(all)];
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
      const q = searchQuery.trim().toLowerCase();
      const haystack = [
        product.title,
        product.category,
        product.collection,
        product.material,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const searchCheck = !q || haystack.includes(q);

      const price = Number(product.price) || 0;
      const priceCheck =
        price >= filters.priceRange[0] && price <= filters.priceRange[1];

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

      const categoryCheck =
        !filters.category ||
        String(product.category || "").toLowerCase() ===
          filters.category.toLowerCase();

      const collectionCheck =
        !filters.collection ||
        String(product.collection || "").toLowerCase() ===
          filters.collection.toLowerCase();

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

    return [...filtered].sort((a, b) => {
      if (sortOption === "featured") return Number(b.featured) - Number(a.featured);
      if (sortOption === "newest") return Number(b.newArrival) - Number(a.newArrival);
      if (sortOption === "bestseller") return Number(b.bestseller) - Number(a.bestseller);
      if (sortOption === "price-low-high") return (a.price || 0) - (b.price || 0);
      if (sortOption === "price-high-low") return (b.price || 0) - (a.price || 0);
      if (sortOption === "discount-high-low")
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      if (sortOption === "name-a-z")
        return String(a.title || "").localeCompare(String(b.title || ""));
      if (sortOption === "name-z-a")
        return String(b.title || "").localeCompare(String(a.title || ""));
      return 0;
    });
  }, [products, searchQuery, filters, sortOption]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (searchQuery)
      chips.push({
        label: `Search: "${searchQuery}"`,
        onRemove: () => setSearchQuery(""),
      });
    if (products.length > 0 && filters.priceRange[1] < priceBounds.max)
      chips.push({
        label: `Up to ${formatCurrency(filters.priceRange[1])}`,
        onRemove: () =>
          setFilters((p) => ({
            ...p,
            priceRange: [priceBounds.min, priceBounds.max],
          })),
      });
    if (filters.category)
      chips.push({
        label: `Category: ${filters.category.replace(/-/g, " ")}`,
        onRemove: () => setFilters((p) => ({ ...p, category: "" })),
      });
    if (filters.collection)
      chips.push({
        label: `Collection: ${filters.collection.replace(/-/g, " ")}`,
        onRemove: () => setFilters((p) => ({ ...p, collection: "" })),
      });
    if (filters.newArrival)
      chips.push({
        label: "New Drops",
        onRemove: () => setFilters((p) => ({ ...p, newArrival: false })),
      });
    if (filters.bestseller)
      chips.push({
        label: "Bestsellers",
        onRemove: () => setFilters((p) => ({ ...p, bestseller: false })),
      });
    if (filters.featured)
      chips.push({
        label: "Atelier Picks",
        onRemove: () => setFilters((p) => ({ ...p, featured: false })),
      });
    if (filters.onSale)
      chips.push({
        label: "Offers",
        onRemove: () => setFilters((p) => ({ ...p, onSale: false })),
      });
    if (filters.inStock)
      chips.push({
        label: "In Stock",
        onRemove: () => setFilters((p) => ({ ...p, inStock: false })),
      });
    filters.sizes.forEach((s) =>
      chips.push({
        label: `Size ${s.toUpperCase()}`,
        onRemove: () => toggleFilterValue("sizes", s),
      })
    );
    filters.colors.forEach((c) => {
      const col = colorOptions.find((x) => x.key === c);
      chips.push({
        label: `Shade: ${col?.name || c}`,
        onRemove: () => toggleFilterValue("colors", c),
      });
    });
    return chips;
  }, [searchQuery, filters, colorOptions, products.length, priceBounds.min, priceBounds.max]);

  const pageHeading = filters.category
    ? filters.category.replace(/-/g, " ")
    : filters.collection
    ? filters.collection.replace(/-/g, " ")
    : filters.newArrival
    ? "New Drops"
    : filters.bestseller
    ? "Best Sellers"
    : filters.featured
    ? "Atelier Picks"
    : filters.onSale
    ? "Archive Offers"
    : "The Archive";

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D]">
      {/* Editorial Studio Alabaster Header */}
      <header className="border-b border-[#0D0D0D]/12 pt-12 sm:pt-16 pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block mb-3">
              MYSTIQUE APPAREL // ARCHIVE
            </span>
            <h1 className="font-display italic text-4xl sm:text-5xl md:text-6xl font-normal capitalize tracking-[-0.02em] text-[#0D0D0D] leading-[1.05]">
              {pageHeading}
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#64625C] mt-3 max-w-xl leading-relaxed">
              Architectural 240 GSM oversized silhouettes milled from bio-washed combed cotton. Engineered for drape, longevity, and quiet presence.
            </p>
          </div>

          <div className="flex items-center gap-4 md:pb-1">
            <span className="hidden sm:block w-8 h-px bg-[#0D0D0D]/25" />
            <span className="font-mono-tech text-[11px] tracking-[0.26em] uppercase text-[#64625C]">
              {loading
                ? "Curating Archive..."
                : `${String(processedProducts.length).padStart(2, "0")} ${
                    processedProducts.length === 1 ? "Piece" : "Pieces"
                  }`}
            </span>
          </div>
        </div>
      </header>

      {/* Main Catalog Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Stark Hairline Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-7 border-b border-[#0D0D0D]/12">
          {/* Quick-Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
            <button
              type="button"
              onClick={clearFilters}
              className={`px-3.5 py-2 rounded-none font-mono-tech text-[10px] tracking-[0.2em] uppercase whitespace-nowrap border transition-colors ${
                activeChips.length === 0
                  ? "bg-[#0D0D0D] text-[#F6F5F1] border-[#0D0D0D]"
                  : "bg-transparent text-[#64625C] border-[#0D0D0D]/15 hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
              }`}
            >
              All
            </button>
            {[
              { key: "newArrival", label: "New Drops" },
              { key: "bestseller", label: "Bestsellers" },
              { key: "featured", label: "Atelier Picks" },
              { key: "onSale", label: "Offers" },
              { key: "inStock", label: "In Stock" },
            ].map((tab) => {
              const active = Boolean(filters[tab.key]);
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, [tab.key]: !prev[tab.key] }))
                  }
                  className={`px-3.5 py-2 rounded-none font-mono-tech text-[10px] tracking-[0.2em] uppercase whitespace-nowrap border transition-colors ${
                    active
                      ? "bg-[#0D0D0D] text-[#F6F5F1] border-[#0D0D0D]"
                      : "bg-transparent text-[#64625C] border-[#0D0D0D]/15 hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Inline Search, Sort, Density Switcher & Filter Drawer Trigger */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-[#64625C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archive..."
                className="input-atelier w-full pl-9 pr-8 py-2 rounded-none text-xs font-body"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64625C] hover:text-[#0D0D0D]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              aria-label="Sort products"
              className="input-atelier px-3.5 py-2 rounded-none text-xs font-body cursor-pointer bg-white"
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="bestseller">Sort: Bestseller</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="discount-high-low">Biggest Savings</option>
              <option value="name-a-z">Name: A to Z</option>
              <option value="name-z-a">Name: Z to A</option>
            </select>

            {/* Desktop 3 / 4 Column Density Switcher */}
            <div className="hidden lg:flex items-center border border-[#0D0D0D]/16 bg-white">
              <button
                type="button"
                onClick={() => setGridColumns(3)}
                aria-label="3 column grid"
                title="3 Columns"
                className={`p-2 transition-colors ${
                  gridColumns === 3
                    ? "bg-[#0D0D0D] text-[#F6F5F1]"
                    : "text-[#64625C] hover:text-[#0D0D0D]"
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setGridColumns(4)}
                aria-label="4 column grid"
                title="4 Columns"
                className={`p-2 border-l border-[#0D0D0D]/12 transition-colors ${
                  gridColumns === 4
                    ? "bg-[#0D0D0D] text-[#F6F5F1]"
                    : "text-[#64625C] hover:text-[#0D0D0D]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filters Drawer Trigger */}
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-white border border-[#0D0D0D]/25 hover:border-[#0D0D0D] font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#0D0D0D] transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 bg-[#0D0D0D] text-[#F6F5F1] text-[9px] leading-none">
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Removable Monochrome Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {activeChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-white border border-[#0D0D0D]/20 text-[#0D0D0D] font-mono-tech text-[10px] tracking-[0.14em] uppercase hover:bg-[#0D0D0D] hover:text-[#F6F5F1] hover:border-[#0D0D0D] transition-colors"
              >
                <span>{chip.label}</span>
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono-tech text-[10px] tracking-[0.18em] uppercase text-[#64625C] hover:text-[#0D0D0D] underline underline-offset-4 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        )}

        {/* Product Lookbook Grid */}
        {loading ? (
          <div
            className={`grid ${
              gridColumns === 3
                ? "grid-cols-2 md:grid-cols-3"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            } gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12`}
          >
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="space-y-3">
                <div className="aspect-[3/4] rounded-none skeleton-shimmer border border-[#0D0D0D]/8" />
                <div className="h-3.5 w-3/4 rounded-none skeleton-shimmer" />
                <div className="h-3 w-1/3 rounded-none skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : processedProducts.length > 0 ? (
          <ProductGrid products={processedProducts} columns={gridColumns} />
        ) : (
          <div className="py-20 px-6 text-center bg-white border border-[#0D0D0D]/12 max-w-xl mx-auto my-10">
            <span className="font-mono-tech text-[10px] tracking-[0.3em] uppercase text-[#64625C] block mb-3">
              00 Results
            </span>
            <h2 className="font-display italic text-2xl sm:text-3xl text-[#0D0D0D] mb-2">
              No Pieces Match Your Selection
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#64625C] mb-8 leading-relaxed">
              Adjust your size, shade, price ceiling, or search query to view the full archive.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-8 py-3.5 rounded-none bg-[#0D0D0D] text-[#F6F5F1] hover:bg-[#262626] font-mono-tech text-[11px] tracking-[0.24em] uppercase transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Slide-Over Alabaster Filter Drawer */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <div className="fixed inset-0 z-[80] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setFilterDrawerOpen(false)}
              className="fixed inset-0 bg-[#0A0A0A]/55"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-sm h-full bg-[#F6F5F1] text-[#0D0D0D] border-l border-[#0D0D0D]/15 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-[#0D0D0D]/12 bg-white flex items-center justify-between">
                <div>
                  <span className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#64625C] block">
                    Catalog Index
                  </span>
                  <h2 className="font-display italic text-2xl text-[#0D0D0D] mt-0.5">
                    Refine Archive
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  aria-label="Close filters"
                  className="w-9 h-9 rounded-none border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Filter Sections */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
                {/* Price Range */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C]">
                      Max Price
                    </span>
                    <span className="font-mono-tech text-xs font-medium text-[#0D0D0D]">
                      {formatCurrency(filters.priceRange[1])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step="50"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], Number(e.target.value)],
                      }))
                    }
                    className="w-full atelier-range"
                  />
                  <div className="flex justify-between font-mono-tech text-[10px] text-[#64625C]">
                    <span>{formatCurrency(priceBounds.min)}</span>
                    <span>{formatCurrency(priceBounds.max)}</span>
                  </div>
                </div>

                {/* Sizes */}
                {sizeOptions.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-[#0D0D0D]/12">
                    <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C] block">
                      Sizes
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {sizeOptions.map((size) => {
                        const active = filters.sizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleFilterValue("sizes", size)}
                            className={`py-2.5 rounded-none font-mono-tech text-[11px] uppercase border transition-colors ${
                              active
                                ? "bg-[#0D0D0D] text-[#F6F5F1] border-[#0D0D0D]"
                                : "bg-white text-[#0D0D0D] border-[#0D0D0D]/15 hover:border-[#0D0D0D]"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {colorOptions.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-[#0D0D0D]/12">
                    <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C] block">
                      Shades
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.map((color) => {
                        const active = filters.colors.includes(color.key);
                        return (
                          <button
                            key={color.key}
                            type="button"
                            onClick={() => toggleFilterValue("colors", color.key)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-none text-xs border transition-colors text-left ${
                              active
                                ? "bg-[#0D0D0D] border-[#0D0D0D] text-[#F6F5F1]"
                                : "bg-white border-[#0D0D0D]/15 text-[#0D0D0D] hover:border-[#0D0D0D]"
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-[#0D0D0D]/25 flex-shrink-0"
                              style={{ backgroundColor: color.hexCode }}
                            />
                            <span className="truncate capitalize">{color.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {categoryOptions.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-[#0D0D0D]/12">
                    <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C] block">
                      Categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map((cat) => {
                        const active = filters.category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                category: prev.category === cat ? "" : cat,
                              }))
                            }
                            className={`px-3.5 py-2 rounded-none text-xs capitalize border transition-colors ${
                              active
                                ? "bg-[#0D0D0D] text-[#F6F5F1] border-[#0D0D0D]"
                                : "bg-white text-[#0D0D0D] border-[#0D0D0D]/15 hover:border-[#0D0D0D]"
                            }`}
                          >
                            {cat.replace(/-/g, " ")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Collections */}
                {collectionOptions.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-[#0D0D0D]/12">
                    <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C] block">
                      Collections
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {collectionOptions.map((col) => {
                        const active = filters.collection === col;
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                collection: prev.collection === col ? "" : col,
                              }))
                            }
                            className={`px-3.5 py-2 rounded-none text-xs capitalize border transition-colors ${
                              active
                                ? "bg-[#0D0D0D] text-[#F6F5F1] border-[#0D0D0D]"
                                : "bg-white text-[#0D0D0D] border-[#0D0D0D]/15 hover:border-[#0D0D0D]"
                            }`}
                          >
                            {col.replace(/-/g, " ")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-[#0D0D0D]/12 bg-white flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 py-3 rounded-none border border-[#0D0D0D]/25 text-[#0D0D0D] hover:border-[#0D0D0D] font-mono-tech text-[10px] uppercase tracking-[0.22em] transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="flex-1 py-3 rounded-none bg-[#0D0D0D] text-[#F6F5F1] hover:bg-[#262626] font-mono-tech text-[10px] uppercase tracking-[0.22em] transition-colors"
                >
                  Show {processedProducts.length}
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <Newsletter />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] flex items-center justify-center">
          <div className="font-mono-tech text-[11px] tracking-[0.3em] uppercase text-[#64625C]">
            Loading Archive...
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
