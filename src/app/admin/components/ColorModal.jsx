"use client";

import Modal from "./Modal";
import { useState, useEffect } from "react";

export default function ColorModal({
  isOpen,
  onClose,
  onSave,
  editingColor = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    hexCode: "#000000",
    description: "",
    colorSwatch: null,
  });

  const [previewColor, setPreviewColor] = useState("#000000");

  useEffect(() => {
    if (editingColor) {
      setFormData({
        name: editingColor.name || "",
        hexCode: editingColor.hexCode || "#000000",
        description: editingColor.description || "",
        colorSwatch: editingColor.colorSwatch || null,
      });
      setPreviewColor(editingColor.hexCode || "#000000");
    } else {
      setFormData({
        name: "",
        hexCode: "#000000",
        description: "",
        colorSwatch: null,
      });
      setPreviewColor("#000000");
    }
  }, [editingColor, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "hexCode") {
      setPreviewColor(value);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Color name is required");
      return;
    }

    // Validate hex code format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(formData.hexCode)) {
      alert("Please enter a valid hex color code (e.g., #FF5733 or #F00)");
      return;
    }

    onSave(formData);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
      : "rgb(0,0,0)";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingColor ? "Edit Color" : "Add New Color"}
      size="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-3">
        {/* Color Preview */}
        <div className="flex gap-4 items-start">
          <div className="flex flex-col gap-2 flex-1">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Preview
            </label>
            <div className="flex gap-2">
              <div
                className="w-24 h-24 rounded-lg border border-white/20 shadow-lg"
                style={{ backgroundColor: previewColor }}
                title={previewColor}
              />
              <div className="flex flex-col justify-center gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Hex</p>
                  <p className="text-white font-mono">{previewColor.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500">RGB</p>
                  <p className="text-white font-mono text-[10px]">{hexToRgb(previewColor)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            Color Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Midnight Black, Ocean Blue"
            className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.name.length} characters</p>
        </div>

        {/* Hex Code */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            Hex Code *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="hexCode"
              value={formData.hexCode}
              onChange={handleInputChange}
              placeholder="#000000"
              maxLength="7"
              className="flex-1 px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 font-mono"
            />
            <input
              type="color"
              name="hexCode"
              value={formData.hexCode}
              onChange={handleInputChange}
              className="w-12 h-10 rounded cursor-pointer border border-white/20"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Format: #RRGGBB or #RGB</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Optional description of this color..."
            className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 h-20 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.description.length} characters</p>
        </div>

        {/* Info */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-200">
          <p className="font-semibold mb-1">💡 Color Swatch</p>
          <p>Upload an image/texture for more accurate color representation. This is optional.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/50"
          >
            {editingColor ? "Save Color" : "Create Color"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
