"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { client } from "../../../sanity";
import { Upload, X } from "lucide-react";

export default function PromoCountdownModal({
  isOpen,
  onClose,
  onSave,
  promoData,
  isEditing,
}) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState(
    promoData || {
      title: "",
      subtitle: "",
      description: "",
      code: "",
      discountPercentage: 0,
      backgroundImage: null,
      active: true,
      endDate: "",
    }
  );

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && promoData) {
      setFormData(promoData);
    } else if (isOpen && !isEditing) {
      // Reset form for new promo countdown
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        code: "",
        discountPercentage: 0,
        backgroundImage: null,
        active: true,
        endDate: "",
      });
    }
  }, [isOpen, isEditing, promoData]);

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
        alt: "Promo countdown background image",
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.subtitle || !formData.code) {
      alert("Please fill in all required fields (Title, Subtitle, Code)");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Promo Countdown" : "Create Promo Countdown"}
      size="2xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
        {/* Live Preview */}
        <div className="border border-white/20 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-3 py-2 border-b border-white/10">
            <p className="text-xs font-semibold text-gray-400">LIVE PREVIEW</p>
          </div>
          <div
            className="relative p-8 text-center bg-gradient-to-br from-black via-gray-900 to-black"
            style={{
              backgroundImage: formData.backgroundImage
                ? `url(${getImageUrl(formData.backgroundImage)})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {formData.backgroundImage && (
              <div className="absolute inset-0 bg-black/60" />
            )}
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">
                {formData.title || "Title"}{" "}
                <span className="text-red-500">{formData.subtitle || "Subtitle"}</span>
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                {formData.description || "Description goes here"}
              </p>
              <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3">
                <p className="text-xs text-gray-400 mb-1">Use Code</p>
                <p className="text-2xl font-bold text-yellow-400 tracking-wider">
                  {formData.code || "PROMO"}
                </p>
                {formData.discountPercentage > 0 && (
                  <p className="text-xs text-green-400 mt-1">
                    {formData.discountPercentage}% OFF
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Background Image Upload */}
        {formData.backgroundImage ? (
          <div className="relative w-full h-48 bg-black/40 border border-white/20 rounded overflow-hidden group">
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-2" />
                <p className="text-white text-xs font-semibold">{uploadProgress}%</p>
              </div>
            )}
            <img
              src={getImageUrl(formData.backgroundImage)}
              alt="Background"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x300?text=Background+Image";
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
        ) : (
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
            <label className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300 font-semibold mb-1">
                Upload Background Image (Optional)
              </p>
              <p className="text-xs text-gray-500">Click to browse files</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="The Void"
              className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">First part of title</p>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Subtitle *
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              placeholder="Is Closing"
              className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Second part (highlighted)</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Special discount for a limited time..."
            rows={2}
            className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Promo Code */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Promo Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="VOID20"
              className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none uppercase font-mono font-bold"
            />
            <p className="text-xs text-gray-500 mt-1">Discount code to display</p>
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Discount %
            </label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              placeholder="20"
              min="0"
              max="100"
              className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Display percentage</p>
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            End Date (Optional)
          </label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">When the promo expires</p>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleInputChange}
            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
          />
          <label htmlFor="active" className="text-sm text-green-300 font-medium cursor-pointer">
            Active - Show this promo countdown on the website
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            {isEditing ? "Update Promo" : "Create Promo"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Tips */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <p className="text-xs font-semibold text-purple-300 mb-2">💡 Pro Tips:</p>
          <ul className="text-xs text-purple-200 space-y-1 list-disc list-inside">
            <li>Upload a dramatic background image for maximum impact</li>
            <li>Keep title short and attention-grabbing (2-4 words)</li>
            <li>Use ALL CAPS for promo codes for better visibility</li>
            <li>Show only one active promo countdown at a time</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
