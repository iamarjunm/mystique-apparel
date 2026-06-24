"use client";

import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, columns = 4 }) => {
  const gridClass = columns === 5
    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`max-w-[1600px] mx-auto px-2 sm:px-4 py-2 sm:py-4 grid ${gridClass} gap-3 sm:gap-4 md:gap-5 lg:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
