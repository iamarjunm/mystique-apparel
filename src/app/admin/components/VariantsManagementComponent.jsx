"use client";

import { useState } from "react";
import ColorSearchComponent from "./ColorSearchComponent";

export default function VariantsManagementComponent({
  variants = [],
  onVariantAdd,
  onVariantDelete,
}) {
  const [expandedVariant, setExpandedVariant] = useState(null);
  const [sizeStockForm, setSizeStockForm] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);

  const sizes = ["xxs", "xs", "s", "m", "l", "xl", "xxl"];

  const handleAddVariant = () => {
    if (!selectedColor) {
      alert("Please select a color");
      return;
    }

    const newVariant = {
      _key: Math.random().toString(36).substr(2, 9),
      color: selectedColor,
      sizeStock: sizeStockForm,
      priceAdjustment: 0,
    };

    onVariantAdd(newVariant);
    setSelectedColor(null);
    setSizeStockForm({
      xxs: 0,
      xs: 0,
      s: 0,
      m: 0,
      l: 0,
      xl: 0,
      xxl: 0,
    });
  };

  const handleStockChange = (size, value) => {
    setSizeStockForm((prev) => ({
      ...prev,
      [size]: parseInt(value) || 0,
    }));
  };

  const getTotalStock = (variant) => {
    if (!variant.sizeStock) return 0;
    return (
      (variant.sizeStock.xxs || 0) +
      (variant.sizeStock.xs || 0) +
      (variant.sizeStock.s || 0) +
      (variant.sizeStock.m || 0) +
      (variant.sizeStock.l || 0) +
      (variant.sizeStock.xl || 0) +
      (variant.sizeStock.xxl || 0)
    );
  };

  return (
    <div className="border-b border-white/10 pb-5">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <span className="text-lg">🎨</span> Color Variants & Stock
      </h3>

      {/* Add New Variant */}
      <div className="mb-5 p-4 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-xs font-semibold text-blue-300 mb-3">➕ Add New Color Variant</p>

        {/* Color Search */}
        <ColorSearchComponent
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          onColorRemove={() => setSelectedColor(null)}
        />

        {/* Stock Input for New Variant */}
        {selectedColor && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {sizes.map((size) => (
              <div key={size}>
                <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase">
                  {size}
                </label>
                <input
                  type="number"
                  min="0"
                  value={sizeStockForm[size] || 0}
                  onChange={(e) => handleStockChange(size, e.target.value)}
                  className="w-full px-2 py-1.5 bg-black/40 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAddVariant}
          disabled={!selectedColor}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-xs font-semibold transition-colors"
        >
          Add Variant
        </button>
      </div>

      {/* Variants List */}
      <div className="space-y-2">
        {variants && variants.length > 0 ? (
          variants.map((variant, idx) => (
            <div key={idx} className="border border-white/10 rounded overflow-hidden">
              {/* Variant Header */}
              <div
                onClick={() =>
                  setExpandedVariant(expandedVariant === idx ? null : idx)
                }
                className="w-full px-4 py-3 bg-black/40 hover:bg-black/60 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded border border-white/30"
                    style={{
                      backgroundColor: variant.color?.hexCode || "#999",
                    }}
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">
                      {variant.color?.name || "Unknown Color"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {getTotalStock(variant)} | Adjust: +₹{variant.priceAdjustment || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {expandedVariant === idx ? "▼" : "▶"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVariantDelete(idx);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors text-xs px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedVariant === idx && (
                <div className="px-4 py-3 bg-black/20 border-t border-white/10">
                  <p className="text-xs font-semibold text-blue-300 mb-3">Edit Stock Levels</p>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                      <div key={size}>
                        <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase">
                          {size}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.sizeStock?.[size] || 0}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[idx] = {
                              ...newVariants[idx],
                              sizeStock: {
                                ...newVariants[idx].sizeStock,
                                [size]: parseInt(e.target.value) || 0,
                              },
                            };
                            // Call parent with updated variants array
                            onVariantAdd?.(newVariants[idx], idx, true); // true = update mode
                          }}
                          className="w-full px-2 py-1.5 bg-black/40 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded">
                    <p className="text-xs text-green-300">
                      💾 Changes are saved automatically as you type
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 bg-black/20 rounded text-center">
            <p className="text-xs text-gray-500">No variants added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
