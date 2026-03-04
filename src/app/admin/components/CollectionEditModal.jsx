"use client";

import { useState } from "react";
import Modal from "./Modal";
import { client } from "../../../sanity";

export default function CollectionEditModal({
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
          name: "collectionImage",
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
        name: "collectionImage",
        value: null,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Collection" : "Add New Collection"}
      size="lg"
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">
            Collection Title *
          </label>
          <input
            type="text"
            name="collectionTitle"
            value={formData.collectionTitle || ""}
            onChange={onInputChange}
            placeholder="Enter collection title"
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">
            Description
          </label>
          <textarea
            name="collectionDescription"
            value={formData.collectionDescription || ""}
            onChange={onInputChange}
            placeholder="Enter collection description"
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 h-24 resize-none"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Collection Image *
          </label>

          {formData.collectionImage ? (
            <div className="relative w-full h-40 bg-black/40 border border-white/20 rounded overflow-hidden group">
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                  <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-2" />
                  <p className="text-white text-xs font-semibold">{uploadProgress}%</p>
                </div>
              )}
              <img
                src={getImageUrl(formData.collectionImage)}
                alt="Collection"
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

        {/* Featured Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="collectionFeatured"
            checked={formData.collectionFeatured || false}
            onChange={(e) => {
              onInputChange({
                target: {
                  name: "collectionFeatured",
                  type: "checkbox",
                  checked: e.target.checked,
                },
              });
            }}
            className="w-4 h-4 cursor-pointer accent-blue-500"
          />
          <label className="text-sm text-white font-semibold cursor-pointer">
            Featured Collection (Display on homepage)
          </label>
        </div>

        {/* Info Box */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 text-xs text-purple-200">
          <p className="font-semibold mb-1">📌 About Collections</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Group related products into themed collections</li>
            <li>Collections appear on homepage and collection pages</li>
            <li>Products can be added to collections in Sanity Studio</li>
            <li>Image is required for collection cards</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-white/10">
          <button
            onClick={onSave}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
          >
            Save Collection
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
