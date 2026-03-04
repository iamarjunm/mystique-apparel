"use client";

import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import Modal from "./Modal";

export default function StockManagementComponent({
  variants = [],
  onStockUpdate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [stockData, setStockData] = useState({
    xxs: 0,
    xs: 0,
    s: 0,
    m: 0,
    l: 0,
    xl: 0,
    xxl: 0,
  });

  const sizes = ["xxs", "xs", "s", "m", "l", "xl", "xxl"];
  const sizeLabels = {
    xxs: "XXS",
    xs: "XS",
    s: "S",
    m: "M",
    l: "L",
    xl: "XL",
    xxl: "XXL",
  };

  const handleOpenStockModal = (variant) => {
    setEditingVariant(variant);
    if (variant?.sizeStock) {
      setStockData(variant.sizeStock);
    } else {
      setStockData({
        xxs: 0,
        xs: 0,
        s: 0,
        m: 0,
        l: 0,
        xl: 0,
        xxl: 0,
      });
    }
    setIsOpen(true);
  };

  const handleStockChange = (size, value) => {
    setStockData((prev) => ({
      ...prev,
      [size]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const handleSaveStock = () => {
    if (editingVariant) {
      onStockUpdate(editingVariant.color?.name, stockData);
    }
    setIsOpen(false);
    setEditingVariant(null);
  };

  const getTotalStock = (sizeStock) => {
    if (!sizeStock) return 0;
    return Object.values(sizeStock).reduce((a, b) => a + b, 0);
  };

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <span>📦</span> Stock Management
        </h3>

        {variants.length === 0 ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-300">
            <p>No variants added yet. Add variants in Sanity Studio first.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {variants.map((variant, idx) => {
              const totalStock = getTotalStock(variant.sizeStock);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded"
                >
                  <div className="flex items-center gap-3">
                    {variant.color?.hexCode && (
                      <div
                        className="w-5 h-5 rounded border border-white/30"
                        style={{ backgroundColor: variant.color.hexCode }}
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {variant.color?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Total: {totalStock} units
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenStockModal(variant)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs py-1.5 px-3 rounded transition-colors font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit Stock
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stock Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Edit Stock - ${editingVariant?.color?.name || "Variant"}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-xs text-blue-300">
            <p className="font-semibold mb-2">💡 Size-Based Stock</p>
            <p>Set how many units are available for each size</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {sizes.map((size) => (
              <div key={size}>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  {sizeLabels[size]}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockData[size]}
                  onChange={(e) =>
                    handleStockChange(size, e.target.value)
                  }
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded p-3 text-xs text-green-300">
            <p className="font-semibold">
              Total Stock: {Object.values(stockData).reduce((a, b) => a + b, 0)} units
            </p>
          </div>

          <div className="flex gap-2 pt-3 border-t border-white/10">
            <button
              onClick={handleSaveStock}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
            >
              Save Stock
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
