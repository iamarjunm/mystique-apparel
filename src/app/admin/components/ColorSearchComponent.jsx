"use client";

import { useState, useEffect } from "react";
import { client } from "../../../sanity";

export default function ColorSearchComponent({
  selectedColor,
  onColorSelect,
  onColorRemove,
}) {
  const [colors, setColors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredColors, setFilteredColors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const result = await client.fetch(`*[_type == "color"] | order(name asc)`);
        setColors(result || []);
        setFilteredColors(result || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching colors:", error);
        setLoading(false);
      }
    };
    fetchColors();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = colors.filter((color) =>
      color.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredColors(filtered);
  };

  const handleSelectColor = (color) => {
    onColorSelect({
      _id: color._id,
      name: color.name,
      hexCode: color.hexCode,
      slug: color.slug,
    });
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full">
      {/* Selected Color Display */}
      {selectedColor ? (
        <div className="mb-3 flex items-center gap-3 p-3 bg-black/30 border border-white/10 rounded">
          <div
            className="w-8 h-8 rounded border border-white/30"
            style={{ backgroundColor: selectedColor.hexCode || "#999" }}
          />
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">{selectedColor.name}</p>
            <p className="text-xs text-gray-500">{selectedColor.hexCode}</p>
          </div>
          <button
            onClick={() => onColorRemove()}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            Select Color *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search colors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4m4 4a4 4 0 004-4m0 0a4 4 0 00-4-4m4 4a4 4 0 014-4" />
              </svg>
            </div>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-white/20 rounded shadow-lg z-50 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-xs text-gray-500 text-center">Loading colors...</div>
              ) : filteredColors.length > 0 ? (
                filteredColors.map((color) => (
                  <button
                    key={color._id}
                    onClick={() => handleSelectColor(color)}
                    className="w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-3"
                  >
                    <div
                      className="w-6 h-6 rounded border border-white/30 flex-shrink-0"
                      style={{ backgroundColor: color.hexCode || "#999" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{color.name}</p>
                      <p className="text-xs text-gray-500">{color.hexCode}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-gray-500 text-center">No colors found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
