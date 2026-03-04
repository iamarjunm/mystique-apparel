"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { client } from "@/sanity";

export default function DiscountCodeModal({ isOpen, onClose, onSave, editingCode = null }) {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    percentageOff: 0,
    fixedAmountOff: 0,
    buyQuantity: 1,
    getQuantity: 1,
    getDiscountPercentage: 100,
    minimumPurchaseAmount: 0,
    maximumDiscountAmount: 0,
    appliesTo: "entireOrder",
    specificProducts: [],
    specificCategories: [],
    specificCollections: [],
    usageLimit: null,
    usageLimitPerCustomer: null,
    startDate: "",
    endDate: "",
    isActive: true,
    timesUsed: 0,
  });

  // Load editing data
  useEffect(() => {
    if (editingCode) {
      setFormData({
        code: editingCode.code || "",
        description: editingCode.description || "",
        discountType: editingCode.discountType || "percentage",
        percentageOff: editingCode.percentageOff || 0,
        fixedAmountOff: editingCode.fixedAmountOff || 0,
        buyQuantity: editingCode.buyQuantity || 1,
        getQuantity: editingCode.getQuantity || 1,
        getDiscountPercentage: editingCode.getDiscountPercentage || 100,
        minimumPurchaseAmount: editingCode.minimumPurchaseAmount || 0,
        maximumDiscountAmount: editingCode.maximumDiscountAmount || 0,
        appliesTo: editingCode.appliesTo || "entireOrder",
        specificProducts: editingCode.specificProducts || [],
        specificCategories: editingCode.specificCategories || [],
        specificCollections: editingCode.specificCollections || [],
        usageLimit: editingCode.usageLimit || null,
        usageLimitPerCustomer: editingCode.usageLimitPerCustomer || null,
        startDate: editingCode.startDate || "",
        endDate: editingCode.endDate || "",
        isActive: editingCode.isActive !== undefined ? editingCode.isActive : true,
        timesUsed: editingCode.timesUsed || 0,
      });
    } else {
      // Reset form for new code
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        percentageOff: 0,
        fixedAmountOff: 0,
        buyQuantity: 1,
        getQuantity: 1,
        getDiscountPercentage: 100,
        minimumPurchaseAmount: 0,
        maximumDiscountAmount: 0,
        appliesTo: "entireOrder",
        specificProducts: [],
        specificCategories: [],
        specificCollections: [],
        usageLimit: null,
        usageLimitPerCustomer: null,
        startDate: "",
        endDate: "",
        isActive: true,
        timesUsed: 0,
      });
    }
  }, [editingCode, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate code format
    if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      alert("Code must be uppercase letters, numbers, hyphens, or underscores only");
      return;
    }

    onSave(formData);
  };

  const getDiscountSummary = () => {
    switch (formData.discountType) {
      case "percentage":
        return `${formData.percentageOff}% off`;
      case "fixed":
        return `₹${formData.fixedAmountOff} off`;
      case "freeShipping":
        return "Free Shipping";
      case "buyXGetY":
        return `Buy ${formData.buyQuantity} Get ${formData.getQuantity} (${formData.getDiscountPercentage}% off)`;
      default:
        return "";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingCode ? "Edit Discount Code" : "Create Discount Code"} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Live Preview */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{formData.code || "CODE"}</div>
            <div className="text-lg text-purple-300 mb-1">{getDiscountSummary()}</div>
            {formData.minimumPurchaseAmount > 0 && (
              <div className="text-sm text-gray-400">Min. purchase: ₹{formData.minimumPurchaseAmount}</div>
            )}
            <div className="mt-2">
              <span className={`px-3 py-1 rounded-full text-xs ${formData.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Discount Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none uppercase"
              placeholder="SUMMER2026"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Uppercase letters, numbers, hyphens, underscores only</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Internal Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              rows="2"
              placeholder="Internal note about this discount"
            />
          </div>
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Discount Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "percentage", label: "Percentage Off" },
              { value: "fixed", label: "Fixed Amount Off" },
              { value: "freeShipping", label: "Free Shipping" },
              { value: "buyXGetY", label: "Buy X Get Y" },
            ].map((type) => (
              <label key={type.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="discountType"
                  value={type.value}
                  checked={formData.discountType === type.value}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.discountType === type.value
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : "border-white/10 bg-black/30 text-gray-400 hover:border-white/20"
                }`}>
                  <div className="font-medium text-sm">{type.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Discount Values */}
        {formData.discountType === "percentage" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Percentage Off (0-100) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="percentageOff"
                value={formData.percentageOff}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Discount Amount (Optional)
              </label>
              <input
                type="number"
                name="maximumDiscountAmount"
                value={formData.maximumDiscountAmount}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="Cap discount at ₹"
              />
            </div>
          </div>
        )}

        {formData.discountType === "fixed" && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fixed Amount Off (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="fixedAmountOff"
              value={formData.fixedAmountOff}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
        )}

        {formData.discountType === "buyXGetY" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buy Quantity (X) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="buyQuantity"
                value={formData.buyQuantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Get Quantity (Y) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="getQuantity"
                value={formData.getQuantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discount % on Y items
              </label>
              <input
                type="number"
                name="getDiscountPercentage"
                value={formData.getDiscountPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">100 = free, 50 = half off</p>
            </div>
          </div>
        )}

        {/* Purchase Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Minimum Purchase Amount (₹)
          </label>
          <input
            type="number"
            name="minimumPurchaseAmount"
            value={formData.minimumPurchaseAmount}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            placeholder="0 for no minimum"
          />
        </div>

        {/* Applies To */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Applies To <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "entireOrder", label: "Entire Order" },
              { value: "specificProducts", label: "Specific Products" },
              { value: "specificCategories", label: "Specific Categories" },
              { value: "specificCollections", label: "Specific Collections" },
            ].map((type) => (
              <label key={type.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="appliesTo"
                  value={type.value}
                  checked={formData.appliesTo === type.value}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.appliesTo === type.value
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : "border-white/10 bg-black/30 text-gray-400 hover:border-white/20"
                }`}>
                  <div className="font-medium text-sm">{type.label}</div>
                </div>
              </label>
            ))}
          </div>
          {formData.appliesTo !== "entireOrder" && (
            <p className="text-xs text-yellow-500 mt-2">
              Note: Specific selection of products/categories/collections requires additional implementation
            </p>
          )}
        </div>

        {/* Usage Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Usage Limit
            </label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value ? parseInt(e.target.value) : null }))}
              min="0"
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              placeholder="Unlimited"
            />
            <p className="text-xs text-gray-500 mt-1">Max times this code can be used total</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Usage Limit Per Customer
            </label>
            <input
              type="number"
              name="usageLimitPerCustomer"
              value={formData.usageLimitPerCustomer || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, usageLimitPerCustomer: e.target.value ? parseInt(e.target.value) : null }))}
              min="0"
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              placeholder="Unlimited"
            />
            <p className="text-xs text-gray-500 mt-1">Max times one customer can use</p>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              placeholder="No expiration"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-5 h-5 rounded bg-black/50 border border-white/10 text-purple-500 focus:ring-purple-500"
          />
          <label className="text-sm font-medium text-gray-300">
            Is Active (Enable this discount code)
          </label>
        </div>

        {/* Times Used (Read-only) */}
        {editingCode && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="text-sm text-blue-300">
              This code has been used <span className="font-bold text-blue-200">{formData.timesUsed}</span> times
            </div>
          </div>
        )}

        {/* Pro Tips */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Pro Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Use clear, memorable codes like SUMMER2026 or WELCOME10</li>
            <li>• Set minimum purchase amounts to protect margins</li>
            <li>• Cap percentage discounts with max amounts for expensive items</li>
            <li>• Use usage limits to create urgency</li>
            <li>• Test codes thoroughly before launching campaigns</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-colors"
          >
            {editingCode ? "Update" : "Create"} Discount Code
          </button>
        </div>
      </form>
    </Modal>
  );
}
