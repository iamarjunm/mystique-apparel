"use client";

import { useState } from "react";
import { Upload, X, Plus, Edit2 } from "lucide-react";
import { client } from "../../../sanity";

export default function ImageGalleryComponent({
  mainImage = null,
  gallery = [],
  onImageAdd,
  onImageRemove,
  onImageAltChange,
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadingImageIdx, setUploadingImageIdx] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingAltIdx, setEditingAltIdx] = useState(null);
  const [altTextInput, setAltTextInput] = useState("");

  const getImageUrl = (image) => {
    if (!image) return null;
    if (typeof image === "string") return image;
    if (image.preview) return image.preview;
    if (image.url) return image.url;
    if (image.asset?._ref) {
      const imageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`;
      return imageUrl;
    }
    return null;
  };

  const uploadImageToSanity = async (file, isMainImage = false, galleryIdx = null) => {
    try {
      if (isMainImage) {
        setUploadingImageIdx("main");
      } else {
        setUploadingImageIdx(galleryIdx);
      }
      setUploadProgress(0);

      // Upload asset to Sanity
      const asset = await client.assets.upload("image", file, {
        filename: file.name,
      });

      setUploadProgress(50);

      // Create image object with asset reference
      const imageObj = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
        alt: file.name.replace(/\.[^/.]+$/, ""),
      };

      setUploadProgress(100);

      // Call parent callback with the uploaded image
      onImageAdd(imageObj, isMainImage, galleryIdx);

      // Reset after success
      setTimeout(() => {
        setUploadingImageIdx(null);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image. Please try again.");
      setUploadingImageIdx(null);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        uploadImageToSanity(file, true);
      }
    }
  };

  const handleFileInput = (e, isMainImage = true, galleryIdx = null) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        uploadImageToSanity(file, isMainImage, galleryIdx);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2">
        <span>🖼️</span> Product Images
      </h3>

      {/* Main Image */}
      <div>
        <p className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Main Image</p>
        {mainImage ? (
          <div className="relative w-full h-48 bg-black/40 border border-white/20 rounded overflow-hidden group">
            {uploadingImageIdx === "main" && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
                <p className="text-white text-xs font-semibold">Uploading...</p>
                <div className="w-20 h-1 bg-black/40 rounded mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            <img
              src={getImageUrl(mainImage)}
              alt="Main product"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
              }}
            />
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Main
            </div>
            <p className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Current Image (From Sanity)
            </p>
            {/* Change Image Button */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
              uploadingImageIdx === "main" ? "opacity-0" : "bg-black/60 opacity-0 group-hover:opacity-100"
            }`}>
              <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer font-semibold text-sm">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileInput(e, true)}
                  className="hidden"
                  disabled={uploadingImageIdx !== null}
                />
              </label>
            </div>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`w-full h-32 border-2 border-dashed rounded flex items-center justify-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/20 bg-black/40 hover:border-white/30"
            }`}
          >
            <label className="w-full h-full flex items-center justify-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInput(e, true)}
                className="hidden"
                disabled={uploadingImageIdx !== null}
              />
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-300 font-semibold">
                  Drag or click to upload
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Gallery */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
            Gallery ({gallery.length})
          </p>
          {gallery.length < 5 && (
            <label className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs py-1 px-2 rounded transition-colors font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ pointerEvents: uploadingImageIdx !== null ? "none" : "auto", opacity: uploadingImageIdx !== null ? 0.5 : 1 }}
            >
              <Plus className="w-3 h-3" />
              Add
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInput(e, false, gallery.length)}
                className="hidden"
                disabled={uploadingImageIdx !== null}
              />
            </label>
          )}
        </div>

        {gallery.length === 0 ? (
          <div className="bg-gray-500/10 border border-gray-500/30 rounded p-3 text-xs text-gray-300">
            <p>No gallery images yet. Upload up to 5 images.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gallery.map((image, idx) => (
              <div key={idx} className="border border-white/10 rounded p-2">
                <div className="flex gap-2 mb-2">
                  <div className="relative w-20 h-20 bg-black/40 border border-white/20 rounded overflow-hidden flex-shrink-0 group">
                    {uploadingImageIdx === idx && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-1" />
                        <p className="text-white text-xs">{uploadProgress}%</p>
                      </div>
                    )}
                    <img
                      src={getImageUrl(image)}
                      alt={`Gallery ${idx}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150x150?text=Image";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingAltIdx === idx ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={altTextInput}
                          onChange={(e) => setAltTextInput(e.target.value)}
                          placeholder="Enter alt text for this image"
                          className="w-full px-2 py-1 bg-black/40 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              onImageAltChange(idx, altTextInput);
                              setEditingAltIdx(null);
                              setAltTextInput("");
                            }}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingAltIdx(null);
                              setAltTextInput("");
                            }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-300 mb-0.5">Alt Text:</p>
                          <p className="text-xs text-gray-400 bg-black/20 rounded p-1.5 break-words">
                            {image.alt || "No alt text"}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingAltIdx(idx);
                            setAltTextInput(image.alt || "");
                          }}
                          className="w-full flex items-center justify-center gap-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs py-1 px-2 rounded font-semibold transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit Alt Text
                        </button>
                      </div>
                    )}
                  </div>

                  {onImageRemove && (
                    <button
                      onClick={() => onImageRemove(idx)}
                      disabled={uploadingImageIdx !== null || editingAltIdx === idx}
                      className="flex-shrink-0 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 p-1.5 rounded transition-colors disabled:opacity-50"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-300">
        <p className="font-semibold mb-1">📌 Note About Images</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Current images are displayed from Sanity</li>
          <li>Hover over main image to see "Change Image" button</li>
          <li>Edit alt text for each gallery image (important for SEO)</li>
          <li>Gallery images can be removed using the X button</li>
          <li>For best results, upload/manage images in Sanity Studio</li>
        </ul>
      </div>
    </div>
  );
}
