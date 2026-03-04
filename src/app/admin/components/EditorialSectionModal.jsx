"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { client } from "@/sanity";

export default function EditorialSectionModal({ isOpen, onClose, onSave, editingSection = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cta: "Discover More",
    ctaLink: "/shop",
    image: null,
    imagePosition: "left",
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load editing data
  useEffect(() => {
    if (editingSection) {
      setFormData({
        title: editingSection.title || "",
        description: editingSection.description || "",
        cta: editingSection.cta || "Discover More",
        ctaLink: editingSection.ctaLink || "/shop",
        image: editingSection.image || null,
        imagePosition: editingSection.imagePosition || "left",
      });
    } else {
      // Reset form for new section
      setFormData({
        title: "",
        description: "",
        cta: "Discover More",
        ctaLink: "/shop",
        image: null,
        imagePosition: "left",
      });
    }
  }, [editingSection, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const uploadedImage = await client.assets.upload("image", file, {
        filename: file.name,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setFormData((prev) => ({
        ...prev,
        image: {
          _type: "image",
          asset: {
            _ref: uploadedImage._id,
            _type: "reference",
          },
        },
      }));

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.image) {
      alert("Please upload an image");
      return;
    }

    onSave(formData);
  };

  const getImageUrl = (image) => {
    if (!image?.asset?._ref) return null;
    const ref = image.asset._ref;
    const [, id, dimensions, format] = ref.split("-");
    return `https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${id}-${dimensions}.${format}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingSection ? "Edit Editorial Section" : "Create Editorial Section"} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Live Preview */}
        <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg p-6">
          <div className={`flex flex-col md:flex-row gap-6 ${formData.imagePosition === "right" ? "md:flex-row-reverse" : ""}`}>
            {/* Image Preview */}
            <div className="md:w-1/2">
              {formData.image ? (
                <img
                  src={getImageUrl(formData.image)}
                  alt="Editorial"
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image preview</span>
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className="md:w-1/2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                {formData.title || "Editorial Title"}
              </h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                {formData.description || "Editorial description goes here..."}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors w-fit"
              >
                {formData.cta}
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Section Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            placeholder="The Mystique Collection"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            rows="5"
            placeholder="Tell a compelling story about this editorial section..."
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Editorial Image <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors">
            {uploading ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Uploading... {uploadProgress}%</div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : formData.image ? (
              <div className="space-y-2">
                <img
                  src={getImageUrl(formData.image)}
                  alt="Uploaded"
                  className="max-h-40 mx-auto rounded-lg"
                />
                <label className="cursor-pointer inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors">
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="text-gray-400 mb-2">Click to upload editorial image</div>
                <div className="text-sm text-gray-500">JPG, PNG, WebP up to 10MB</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="mt-4">
                  <span className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors inline-block">
                    Choose File
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Image Position */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Image Position
          </label>
          <div className="flex gap-4">
            {[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ].map((position) => (
              <label key={position.value} className="cursor-pointer flex-1">
                <input
                  type="radio"
                  name="imagePosition"
                  value={position.value}
                  checked={formData.imagePosition === position.value}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.imagePosition === position.value
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : "border-white/10 bg-black/30 text-gray-400 hover:border-white/20"
                }`}>
                  <div className="font-medium">{position.label}</div>
                  <div className="text-xs mt-1">Image on {position.label.toLowerCase()}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* CTA Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CTA Button Text
            </label>
            <input
              type="text"
              name="cta"
              value={formData.cta}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              placeholder="Discover More"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CTA Link
            </label>
            <input
              type="text"
              name="ctaLink"
              value={formData.ctaLink}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              placeholder="/shop"
            />
          </div>
        </div>

        {/* Pro Tips */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Pro Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Use high-quality, editorial-style photography for best results</li>
            <li>• Keep titles concise and impactful (3-5 words)</li>
            <li>• Write compelling descriptions that tell a story</li>
            <li>• Alternate image positions for visual variety</li>
            <li>• Use hotspot feature in Sanity for precise image cropping</li>
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
            disabled={uploading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingSection ? "Update" : "Create"} Editorial Section
          </button>
        </div>
      </form>
    </Modal>
  );
}
