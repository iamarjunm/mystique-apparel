"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { client } from "../../../sanity";
import { Upload, X } from "lucide-react";

export default function HeroSectionModal({
  isOpen,
  onClose,
  onSave,
  heroData,
  isEditing,
}) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState(
    heroData || {
      heading1: "",
      heading2: "",
      description: "",
      ctaText: "Explore Collection",
      ctaLink: "#collection",
      backgroundImage: null,
    }
  );

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && heroData) {
      setFormData(heroData);
    } else if (isOpen && !isEditing) {
      // Reset form for new hero section
      setFormData({
        heading1: "",
        heading2: "",
        description: "",
        ctaText: "Explore Collection",
        ctaLink: "#collection",
        backgroundImage: null,
      });
    }
  }, [isOpen, isEditing, heroData]);

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
        alt: "Hero section background image",
      };

      setUploadProgress(100);
      setFormData((prev) => ({
        ...prev,
        backgroundImage: imageObj,
      }));

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.heading1 || !formData.heading2 || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Hero Section" : "Create Hero Section"}
      size="2xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
        {/* Preview */}
        {formData.backgroundImage && (
          <div className="relative w-full h-48 bg-black/40 border border-white/20 rounded overflow-hidden group">
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-2" />
                <p className="text-white text-xs font-semibold">{uploadProgress}%</p>
              </div>
            )}
            <img
              src={getImageUrl(formData.backgroundImage)}
              alt="Hero Background"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x300?text=Hero+Image";
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
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
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    backgroundImage: null,
                  }))
                }
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-semibold text-xs"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Heading 1 */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              First Heading Line *
            </label>
            <input
              type="text"
              name="heading1"
              value={formData.heading1}
              onChange={handleInputChange}
              placeholder="e.g., Embrace"
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.heading1.length}/50</p>
          </div>

          {/* Heading 2 */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Second Heading Line *
            </label>
            <input
              type="text"
              name="heading2"
              value={formData.heading2}
              onChange={handleInputChange}
              placeholder="e.g., The Void"
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.heading2.length}/50</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Description/Tagline *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter hero section description..."
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 h-20 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* CTA Text */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              CTA Button Text
            </label>
            <input
              type="text"
              name="ctaText"
              value={formData.ctaText}
              onChange={handleInputChange}
              placeholder="e.g., Explore Collection"
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.ctaText.length}/30</p>
          </div>

          {/* CTA Link */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              CTA Button Link
            </label>
            <input
              type="text"
              name="ctaLink"
              value={formData.ctaLink}
              onChange={handleInputChange}
              placeholder="e.g., /shop or #collection"
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Background Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Background Image
          </label>
          {!formData.backgroundImage && (
            <label className="w-full h-24 border-2 border-dashed border-white/20 rounded flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
              <div className="text-center">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-300 font-semibold">
                  Click to upload background image
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

        {/* Preview Box */}
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded p-4">
          <p className="text-xs font-semibold text-gray-300 mb-3 uppercase">Preview</p>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-purple-400 font-bold text-lg">{formData.heading1}</p>
              <p className="text-purple-300 font-bold text-lg">{formData.heading2}</p>
            </div>
            <p className="text-gray-400 text-xs">{formData.description}</p>
            <button className="bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-blue-600 transition-colors">
              {formData.ctaText}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-xs text-blue-300">
          <p className="font-semibold mb-2">💡 Hero Section Tips</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Keep headings short and impactful (max 50 chars each)</li>
            <li>Description should be concise and compelling</li>
            <li>Use high-quality background images (1920x1080px recommended)</li>
            <li>CTA text should be action-oriented</li>
            <li>Test on mobile devices to ensure readability</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
          >
            Save Hero Section
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
