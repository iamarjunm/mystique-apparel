"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";

export default function AnnouncementBarModal({
  isOpen,
  onClose,
  onSave,
  announcementData,
  isEditing,
}) {
  const [formData, setFormData] = useState(
    announcementData || {
      text: "",
      code: "",
      codeColor: "text-yellow-600",
      active: true,
      order: 0,
    }
  );

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && announcementData) {
      setFormData({
        text: announcementData.text || "",
        code: announcementData.code || "",
        codeColor: announcementData.codeColor || "text-yellow-600",
        active: announcementData.active !== undefined ? announcementData.active : true,
        order: announcementData.order || 0,
      });
    } else if (isOpen && !isEditing) {
      // Reset form for new announcement bar
      setFormData({
        text: "",
        code: "",
        codeColor: "text-yellow-600",
        active: true,
        order: 0,
      });
    }
  }, [isOpen, isEditing, announcementData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    if (!formData.text || formData.text.trim() === "") {
      alert("Please enter announcement text");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Announcement Bar" : "Create Announcement Bar"}
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Live Preview */}
        <div className="border border-white/20 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-3 py-2 border-b border-white/10">
            <p className="text-xs font-semibold text-gray-400">LIVE PREVIEW</p>
          </div>
          <div className="p-4 text-center transition-all duration-300 bg-black">
            <p className="font-semibold text-sm text-white">
              {formData.text || "Your announcement text will appear here..."}
              {formData.code && (
                <span className={`ml-2 font-bold ${formData.codeColor || 'text-yellow-600'}`}>
                  {formData.code}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Announcement Text */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Announcement Text *
          </label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            placeholder="🎉 New Collection Launch! Get 20% off with code"
            rows={3}
            className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Keep it short and impactful. Use emojis to grab attention! 🎊
          </p>
        </div>

        {/* Promo Code */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Promo Code (Optional)
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="LAUNCH20"
              className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none uppercase"
            />
            <p className="text-xs text-gray-500 mt-1">
              Promo code to highlight in the announcement
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Code Color
            </label>
            <select
              name="codeColor"
              value={formData.codeColor}
              onChange={handleInputChange}
              className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="text-red-600">Red</option>
              <option value="text-green-600">Green</option>
              <option value="text-blue-600">Blue</option>
              <option value="text-yellow-600">Yellow</option>
              <option value="text-white">White</option>
            </select>
          </div>
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Display Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Order of announcements in rotation (lower numbers show first)
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleInputChange}
            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
          />
          <label htmlFor="active" className="text-sm text-blue-300 font-medium cursor-pointer">
            Active - Show this announcement on the website
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            {isEditing ? "Update Announcement" : "Create Announcement"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Tips */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-xs font-semibold text-yellow-300 mb-2">💡 Pro Tips:</p>
          <ul className="text-xs text-yellow-200 space-y-1 list-disc list-inside">
            <li>Use emojis to make announcements eye-catching: 🎉 🔥 ⚡ 🎊</li>
            <li>Keep text short and actionable (under 60 characters works best)</li>
            <li>Use promo codes to drive conversions (e.g., LAUNCH20, SAVE30)</li>
            <li>Set display order to control which announcement shows first</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
