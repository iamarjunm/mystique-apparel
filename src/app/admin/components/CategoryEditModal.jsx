"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { client } from "../../../sanity";

export default function CategoryEditModal({
  isOpen,
  onClose,
  onSave,
  formData,
  onInputChange,
  isEditing,
}) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getImageUrl = (image) => {
    if (!image) return null;
    if (typeof image === "string") return image;
    if (image.preview) return image.preview;
    if (image.asset?._ref) {
      const imageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`;
      return imageUrl;
    }
    return null;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadProgress(0);

      const asset = await client.assets.upload("image", file, {
        filename: file.name,
      });

      setUploadProgress(50);

      const imageObj = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
        alt: file.name.replace(/\.[^/.]+$/, ""),
      };

      setUploadProgress(100);

      onInputChange({
        target: {
          name: "categoryImage",
          value: imageObj,
        },
      });

      setTimeout(() => {
        setUploadingImage(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image");
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    onInputChange({
      target: {
        name: "categoryImage",
        value: null,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Category" : "Add New Category"}
      size="lg"
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">
            Category Title *
          </label>
          <input
            type="text"
            name="categoryTitle"
            value={formData.categoryTitle || ""}
            onChange={onInputChange}
            placeholder="Enter category title"
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">
            Description
          </label>
          <textarea
            name="categoryDescription"
            value={formData.categoryDescription || ""}
            onChange={onInputChange}
            placeholder="Enter category description"
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 h-24 resize-none"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Category Image
          </label>

          {formData.categoryImage ? (
            <div className="relative w-full h-40 bg-black/40 border border-white/20 rounded overflow-hidden group">
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                  <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-2" />
                  <p className="text-white text-xs font-semibold">{uploadProgress}%</p>
                </div>
              )}
              <img
                src={getImageUrl(formData.categoryImage)}
                alt="Category"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                <label className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded cursor-pointer font-semibold text-xs">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
                <button
                  onClick={handleRemoveImage}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-semibold text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="w-full h-24 border-2 border-dashed border-white/20 rounded flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
              <div className="text-center">
                <p className="text-xs text-gray-300 font-semibold">
                  Click to upload image
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          )}
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">
            Display Order
          </label>
          <input
            type="number"
            name="categoryOrder"
            value={formData.categoryOrder || 0}
            onChange={onInputChange}
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>

        {/* Info Box */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-200">
          <p className="font-semibold mb-1">📌 About Categories</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Used to organize and filter products</li>
            <li>Images display in category cards</li>
            <li>All fields are stored and managed here</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-white/10">
          <button
            onClick={onSave}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
          >
            Save Category
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
