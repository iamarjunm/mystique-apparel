"use client";

import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products = [], columns = 4 }) => {
  const safeProducts = Array.isArray(products) ? products : [];

  const gridClass =
    columns === 5
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      : columns === 3
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={`grid ${gridClass} gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:gap-x-7 lg:gap-y-14`}
    >
      {safeProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
