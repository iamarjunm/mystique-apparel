"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { client } from "@/sanity";

export default function CategoryModal({ isOpen, onClose, onSave, editingCategory = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    parentCategory: null,
    order: 0,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState([]);

  // Fetch all categories for parent selection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await client.fetch(`*[_type == "category"] { _id, title }`);
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Load editing data
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        title: editingCategory.title || "",
        description: editingCategory.description || "",
        image: editingCategory.image || null,
        parentCategory: editingCategory.parentCategory?._id || null,
        order: editingCategory.order || 0,
      });
    } else {
      // Reset form for new category
      setFormData({
        title: "",
        description: "",
        image: null,
        parentCategory: null,
        order: 0,
      });
    }
  }, [editingCategory, isOpen]);

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

    if (!formData.title) {
      alert("Please enter a category title");
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
    <Modal isOpen={isOpen} onClose={onClose} title={editingCategory ? "Edit Category" : "Create Category"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Live Preview */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-4">
            {formData.image ? (
              <img
                src={getImageUrl(formData.image)}
                alt="Category"
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-xs">No image</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{formData.title || "Category Name"}</h3>
              <p className="text-sm text-gray-400 mt-1">{formData.description || "Category description"}</p>
            </div>
          </div>
        </div>

        {/* Category Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            placeholder="e.g., Men's Clothing"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            rows="3"
            placeholder="Brief description of this category"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category Image
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
                <div className="text-gray-400 mb-2">Click to upload category image</div>
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

        {/* Parent Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Parent Category (Optional)
          </label>
          <select
            name="parentCategory"
            value={formData.parentCategory || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="">None (Top-level category)</option>
            {categories
              .filter((cat) => cat._id !== editingCategory?._id)
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.title}
                </option>
              ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Leave empty for top-level categories</p>
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Display Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>

        {/* Pro Tips */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Pro Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Use clear, descriptive category names</li>
            <li>• Upload high-quality images that represent the category</li>
            <li>• Organize with parent categories for better navigation</li>
            <li>• Use display order to control category sequence</li>
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
            {editingCategory ? "Update" : "Create"} Category
          </button>
        </div>
      </form>
    </Modal>
  );
}
