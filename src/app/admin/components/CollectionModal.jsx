"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { client } from "@/sanity";

export default function CollectionModal({ isOpen, onClose, onSave, editingCollection = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    products: [],
    featured: false,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Fetch all products for selection
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const prods = await client.fetch(`*[_type == "product"] { _id, title, mainImage }`);
        setAvailableProducts(prods);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Load editing data
  useEffect(() => {
    if (editingCollection) {
      setFormData({
        title: editingCollection.title || "",
        description: editingCollection.description || "",
        image: editingCollection.image || null,
        products: editingCollection.products?.map(p => p._id) || [],
        featured: editingCollection.featured || false,
      });
    } else {
      // Reset form for new collection
      setFormData({
        title: "",
        description: "",
        image: null,
        products: [],
        featured: false,
      });
    }
  }, [editingCollection, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProductToggle = (productId) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId],
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
      alert("Please enter a collection title");
      return;
    }

    if (!formData.image) {
      alert("Please upload a collection image");
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
    <Modal isOpen={isOpen} onClose={onClose} title={editingCollection ? "Edit Collection" : "Create Collection"} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Live Preview */}
        <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center gap-4">
            {formData.image ? (
              <img
                src={getImageUrl(formData.image)}
                alt="Collection"
                className="w-24 h-24 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-xs">No image</span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">{formData.title || "Collection Name"}</h3>
                {formData.featured && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Featured</span>
                )}
              </div>
              <p className="text-sm text-gray-400">{formData.description || "Collection description"}</p>
              <p className="text-xs text-gray-500 mt-1">{formData.products.length} products selected</p>
            </div>
          </div>
        </div>

        {/* Collection Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Collection Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-amber-500 focus:outline-none"
            placeholder="e.g., Summer Collection 2026"
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
            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-amber-500 focus:outline-none"
            rows="3"
            placeholder="Describe this collection"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Collection Image <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-amber-500/50 transition-colors">
            {uploading ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Uploading... {uploadProgress}%</div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-orange-600 h-2 rounded-full transition-all duration-300"
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
                <label className="cursor-pointer inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors">
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
                <div className="text-gray-400 mb-2">Click to upload collection image</div>
                <div className="text-sm text-gray-500">JPG, PNG, WebP up to 10MB</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="mt-4">
                  <span className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors inline-block">
                    Choose File
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Products Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Products in Collection
          </label>
          <div className="bg-black/30 border border-white/10 rounded-lg p-4 max-h-60 overflow-y-auto">
            {availableProducts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No products available</p>
            ) : (
              <div className="space-y-2">
                {availableProducts.map((product) => (
                  <label key={product._id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.products.includes(product._id)}
                      onChange={() => handleProductToggle(product._id)}
                      className="w-4 h-4 rounded bg-black/50 border border-white/10 text-amber-500 focus:ring-amber-500"
                    />
                    {product.mainImage && (
                      <img
                        src={getImageUrl(product.mainImage)}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <span className="text-sm text-white">{product.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{formData.products.length} products selected</p>
        </div>

        {/* Featured Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="w-5 h-5 rounded bg-black/50 border border-white/10 text-amber-500 focus:ring-amber-500"
          />
          <label className="text-sm font-medium text-gray-300">
            Featured Collection (Display on homepage)
          </label>
        </div>

        {/* Pro Tips */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-300 mb-2">💡 Pro Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Use compelling collection names that tell a story</li>
            <li>• Upload high-quality banner images</li>
            <li>• Curate products that share a common theme</li>
            <li>• Feature seasonal or promotional collections</li>
            <li>• Update collections regularly to keep content fresh</li>
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
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-white font-semibold hover:from-amber-500 hover:to-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingCollection ? "Update" : "Create"} Collection
          </button>
        </div>
      </form>
    </Modal>
  );
}
