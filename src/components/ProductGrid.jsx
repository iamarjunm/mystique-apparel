"use client";

import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products }) => {
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
