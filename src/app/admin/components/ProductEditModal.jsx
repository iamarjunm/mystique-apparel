"use client";

import Modal from "./Modal";
import ImageGalleryComponent from "./ImageGalleryComponent";
import VariantsManagementComponent from "./VariantsManagementComponent";

export default function ProductEditModal({
  isOpen,
  onClose,
  onSave,
  formData,
  onInputChange,
  isEditing = false,
  isSaving = false,
  categories = [],
}) {
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    onInputChange({ target: { name, value: checked, type: "checkbox" } });
  };

  const getImageUrl = (image) => {
    if (!image?.asset?._ref) return null;
    const imageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`;
    return imageUrl;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Product" : "Add New Product"}
      size="2xl"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-3">
        {/* BASIC INFO */}
        <div className="border-b border-white/10 pb-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="text-lg">📋</span> Basic Information
          </h3>
          
          {/* Current Product Image */}
          {isEditing && formData.mainImage && (
            <div className="mb-4 p-3 bg-black/30 rounded border border-white/10">
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Current Product Image
              </label>
              <div className="relative w-32 h-32 rounded overflow-hidden">
                <img
                  src={getImageUrl(formData.mainImage)}
                  alt="Current product"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">This is the current product image stored in Sanity</p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Main Image Alt Text */}
            {formData.mainImage && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Main Image Alt Text *
                </label>
                <input
                  type="text"
                  name="mainImageAlt"
                  value={formData.mainImageAlt || ""}
                  onChange={onInputChange}
                  placeholder="e.g., Premium cotton t-shirt in navy blue"
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Describe the image for SEO and accessibility. {(formData.mainImageAlt || "").length} characters</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="e.g., Premium Cotton T-Shirt"
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{(formData.title || "").length} characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={onInputChange}
                  placeholder="999"
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.compareAtPrice && formData.price && (
                  <p className="text-xs text-green-400 mt-1">
                    Discount: {Math.round(((formData.compareAtPrice - formData.price) / formData.compareAtPrice) * 100)}%
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={onInputChange}
                  placeholder="1499"
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Product Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                placeholder="Detailed product description..."
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 h-20 resize-none"
              />
            </div>

            {/* Categories Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Categories *
              </label>
              <div className="bg-black/30 border border-white/10 rounded-lg p-3 max-h-40 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-2">No categories available. Create categories first.</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category._id} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedCategories?.includes(category._id) || false}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...(formData.selectedCategories || []), category._id]
                              : (formData.selectedCategories || []).filter(id => id !== category._id);
                            onInputChange({ target: { name: 'selectedCategories', value: newCategories } });
                          }}
                          className="w-4 h-4 rounded bg-black/50 border border-white/10 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-white">{category.title}</span>
                        {category.parentCategory && (
                          <span className="text-xs text-gray-500">({category.parentCategory.title})</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(formData.selectedCategories?.length || 0)} categories selected
              </p>
            </div>

            {/* Available Sizes Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Available Sizes *
              </label>
              <div className="grid grid-cols-7 gap-2">
                {["xxs", "xs", "s", "m", "l", "xl", "xxl"].map((size) => (
                  <label key={size} className="flex flex-col items-center cursor-pointer p-2 bg-black/30 border border-white/10 rounded hover:border-blue-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.availableSizes?.includes(size) || false}
                      onChange={(e) => {
                        const newSizes = e.target.checked
                          ? [...(formData.availableSizes || []), size]
                          : (formData.availableSizes || []).filter(s => s !== size);
                        onInputChange({ target: { name: 'availableSizes', value: newSizes } });
                      }}
                      className="w-4 h-4 rounded bg-black/50 border border-white/10 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-white mt-1 uppercase">{size}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(formData.availableSizes?.length || 0)} sizes available
              </p>
            </div>
          </div>
          
          {/* Current Data Indicator */}
          {isEditing && (
            <div className="mt-3 p-2.5 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-xs text-blue-300">
                ✓ Editing existing product - All current values are displayed in the fields above
              </p>
            </div>
          )}
        </div>

        {/* PHYSICAL ATTRIBUTES */}
        <div className="border-b border-white/10 pb-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="text-lg">👕</span> Physical Attributes
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={onInputChange}
                  placeholder="e.g., 100% Cotton, Polyester"
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={onInputChange}
                  placeholder="0.25"
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Care Instructions
              </label>
              <textarea
                name="careInstructions"
                value={formData.careInstructions}
                onChange={onInputChange}
                placeholder="e.g., Machine wash cold • Lay flat to dry • Do not bleach"
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 h-16 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Size Guide
              </label>
              <textarea
                name="sizeGuide"
                value={formData.sizeGuide}
                onChange={onInputChange}
                placeholder="XXS: 32&quot; • XS: 34&quot; • S: 36&quot; • M: 38&quot; • L: 40&quot; • XL: 42&quot; • XXL: 44&quot;"
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 h-16 resize-none"
              />
            </div>
          </div>
        </div>

        {/* PRODUCT TAGS */}
        <div className="border-b border-white/10 pb-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="text-lg">🏷️</span> Product Tags
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-black/30 border border-white/10 rounded hover:border-blue-500/50 transition-colors">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded bg-black/40 border border-white/20 checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-blue-400">Featured</span>
                <span className="text-xs text-gray-500">Show on homepage</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-black/30 border border-white/10 rounded hover:border-green-500/50 transition-colors">
              <input
                type="checkbox"
                name="newArrival"
                checked={formData.newArrival}
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded bg-black/40 border border-white/20 checked:bg-green-500 checked:border-green-500 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-green-400">New Arrival</span>
                <span className="text-xs text-gray-500">Mark as new</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-black/30 border border-white/10 rounded hover:border-red-500/50 transition-colors">
              <input
                type="checkbox"
                name="bestseller"
                checked={formData.bestseller}
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded bg-black/40 border border-white/20 checked:bg-red-500 checked:border-red-500 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-red-400">Bestseller</span>
                <span className="text-xs text-gray-500">Top seller</span>
              </div>
            </label>
          </div>
        </div>

        {/* ADVANCED FEATURES */}
        <div className="border-b border-white/10 pb-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="text-lg">⚙️</span> Advanced Features
          </h3>

          {/* Images */}
          <div className="mb-5">
            <ImageGalleryComponent
              mainImage={formData.mainImage}
              gallery={formData.gallery}
              onImageAdd={(image, isMainImage, galleryIdx) => {
                if (isMainImage) {
                  // Set main image
                  onInputChange({
                    target: {
                      name: "mainImage",
                      value: image,
                    },
                  });
                } else {
                  // Add to gallery with _key
                  const imageWithKey = {
                    ...image,
                    _key: image._key || Math.random().toString(36).substr(2, 9),
                  };
                  const newGallery = [...(formData.gallery || []), imageWithKey];
                  onInputChange({
                    target: {
                      name: "gallery",
                      value: newGallery,
                    },
                  });
                }
              }}
              onImageRemove={(idx) => {
                const newGallery = formData.gallery.filter((_, i) => i !== idx);
                onInputChange({
                  target: {
                    name: "gallery",
                    value: newGallery,
                  },
                });
              }}
              onImageAltChange={(idx, altText) => {
                const newGallery = formData.gallery.map((img, i) =>
                  i === idx ? { ...img, alt: altText } : img
                );
                onInputChange({
                  target: {
                    name: "gallery",
                    value: newGallery,
                  },
                });
              }}
            />
          </div>

          {/* Variants */}
          <VariantsManagementComponent
            variants={formData.variants}
            onVariantAdd={(variant, idx, isUpdate) => {
              if (isUpdate && idx !== undefined) {
                // Update existing variant
                const newVariants = [...(formData.variants || [])];
                newVariants[idx] = variant;
                onInputChange({
                  target: {
                    name: "variants",
                    value: newVariants,
                  },
                });
              } else {
                // Add new variant
                const newVariants = [...(formData.variants || []), variant];
                onInputChange({
                  target: {
                    name: "variants",
                    value: newVariants,
                  },
                });
              }
            }}
            onVariantDelete={(idx) => {
              const newVariants = formData.variants.filter((_, i) => i !== idx);
              onInputChange({
                target: {
                  name: "variants",
                  value: newVariants,
                },
              });
            }}
          />
        </div>

        {/* SEO SETTINGS */}
        <div className="pb-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="text-lg">🔍</span> SEO Settings
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Meta Title (60 chars max)
                </label>
                <span className={`text-xs font-semibold ${formData.metaTitle.length > 60 ? "text-red-400" : "text-gray-500"}`}>
                  {formData.metaTitle.length}/60
                </span>
              </div>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={onInputChange}
                placeholder="Premium Cotton T-Shirt | Best Quality"
                maxLength="60"
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Meta Description (160 chars max)
                </label>
                <span className={`text-xs font-semibold ${formData.metaDescription.length > 160 ? "text-red-400" : "text-gray-500"}`}>
                  {formData.metaDescription.length}/160
                </span>
              </div>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={onInputChange}
                placeholder="High-quality premium cotton t-shirt. Available in multiple colors and sizes. Perfect for casual wear."
                maxLength="160"
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 h-16 resize-none"
              />
            </div>
          </div>

          <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-200">
            <p className="font-semibold mb-2">📌 Advanced Features</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Variants, categories & collections → Manage in Sanity Studio</li>
              <li>Images & gallery → Upload & crop in Sanity Studio</li>
              <li>Size-specific stock → Set in Sanity Studio</li>
            </ul>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isEditing ? "Saving..." : "Creating..."}</span>
              </>
            ) : (
              <span>{isEditing ? "Save Changes" : "Create Product"}</span>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
