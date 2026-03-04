"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Package, Edit, Trash2, Plus, Tag, Folder, Palette } from "lucide-react";
import Modal from "../components/Modal";
import ProductEditModal from "../components/ProductEditModal";
import CategoryModal from "../components/CategoryModal";
import CollectionModal from "../components/CollectionModal";
import ColorModal from "../components/ColorModal";

const getImageUrl = (image) => {
  try {
    if (!image || !image.asset) return null;
    const imageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`;
    return imageUrl;
  } catch (e) {
    return null;
  }
};

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editingColor, setEditingColor] = useState(null);
  const [formData, setFormData] = useState({
    // Product fields
    title: "",
    price: "",
    compareAtPrice: "",
    description: "",
    material: "",
    weight: "",
    careInstructions: "",
    sizeGuide: "",
    featured: false,
    newArrival: false,
    bestseller: false,
    metaTitle: "",
    metaDescription: "",
    // Images
    mainImage: null,
    mainImageAlt: "",
    gallery: [],
    // Variants
    variants: [],
    selectedCategories: [],
    availableSizes: [],
    // Category fields
    categoryTitle: "",
    // Collection fields
    collectionTitle: "",
    collectionDescription: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [productsData, categoriesData, collectionsData, colorsData] = await Promise.all([
        client.fetch(
          `*[_type == "product"] | order(_createdAt desc) {
            _id,
            title,
            price,
            compareAtPrice,
            description,
            mainImage,
            gallery,
            material,
            weight,
            careInstructions,
            sizeGuide,
            featured,
            newArrival,
            bestseller,
            availableSizes,
            seo{
              metaTitle,
              metaDescription
            },
            variants[]{
              color->{_id, name, hexCode, slug},
              sizeStock{
                xxs, xs, s, m, l, xl, xxl
              },
              priceAdjustment
            },
            categories[]->{_id, title}
          }`
        ),
        client.fetch(
          `*[_type == "category"] | order(_createdAt desc) {
            _id,
            title,
            description,
            slug,
            image,
            parentCategory->{_id, title},
            order
          }`
        ),
        client.fetch(
          `*[_type == "collection"] | order(_createdAt desc) {
            _id,
            title,
            description,
            slug,
            image,
            products[]->{_id, title},
            featured
          }`
        ),
        client.fetch(
          `*[_type == "color"] | order(_createdAt desc) {
            _id,
            name,
            hexCode,
            slug,
            description,
            colorSwatch
          }`
        ),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setCollections(collectionsData);
      setColors(colorsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalStock = (variants) => {
    if (!variants || !Array.isArray(variants)) return 0;
    return variants.reduce((total, variant) => {
      if (!variant.sizeStock) return total;
      return (
        total +
        (variant.sizeStock.xxs || 0) +
        (variant.sizeStock.xs || 0) +
        (variant.sizeStock.s || 0) +
        (variant.sizeStock.m || 0) +
        (variant.sizeStock.l || 0) +
        (variant.sizeStock.xl || 0) +
        (variant.sizeStock.xxl || 0)
      );
    }, 0);
  };

  const isOutOfStock = (variants) => {
    if (!variants || variants.length === 0) return true;
    return variants.every((variant) => {
      if (!variant.sizeStock) return true;
      const totalForVariant =
        (variant.sizeStock.xxs || 0) +
        (variant.sizeStock.xs || 0) +
        (variant.sizeStock.s || 0) +
        (variant.sizeStock.m || 0) +
        (variant.sizeStock.l || 0) +
        (variant.sizeStock.xl || 0) +
        (variant.sizeStock.xxl || 0);
      return totalForVariant <= 0;
    });
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      // Convert block content to plain text for editing
      const descriptionText = Array.isArray(product.description) 
        ? product.description.map(block => 
            block.children?.map(child => child.text).join('') || ''
          ).join('\n\n')
        : product.description || "";
      
      setFormData({
        title: product.title || "",
        price: product.price || "",
        compareAtPrice: product.compareAtPrice || "",
        description: descriptionText,
        material: product.material || "",
        weight: product.weight || "",
        careInstructions: product.careInstructions || "",
        sizeGuide: product.sizeGuide || "",
        featured: product.featured || false,
        newArrival: product.newArrival || false,
        bestseller: product.bestseller || false,
        metaTitle: product.seo?.metaTitle || "",
        metaDescription: product.seo?.metaDescription || "",
        mainImage: product.mainImage || null,
        mainImageAlt: product.mainImage?.alt || "",
        gallery: product.gallery || [],
        variants: product.variants || [],
        selectedCategories: product.categories?.map(cat => cat._id) || [],
        availableSizes: product.availableSizes || [],
        categoryTitle: "",
        collectionTitle: "",
        collectionDescription: "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: "",
        price: "",
        compareAtPrice: "",
        description: "",
        material: "",
        weight: "",
        careInstructions: "",
        sizeGuide: "",
        featured: false,
        newArrival: false,
        bestseller: false,
        metaTitle: "",
        metaDescription: "",
        mainImage: null,
        mainImageAlt: "",
        gallery: [],
        variants: [],
        selectedCategories: [],
        availableSizes: [],
        categoryTitle: "",
        collectionTitle: "",
        collectionDescription: "",
      });
    }
    setIsProductModalOpen(true);
  };

  const handleOpenCategoryModal = (category = null) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      setIsSaving(true);

      // Generate slug from title
      const slug = categoryData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (editingCategory && editingCategory._id) {
        // Update existing category
        await client
          .patch(editingCategory._id)
          .set({
            title: categoryData.title,
            slug: { _type: "slug", current: slug },
            description: categoryData.description,
            image: categoryData.image,
            parentCategory: categoryData.parentCategory ? { _type: "reference", _ref: categoryData.parentCategory } : undefined,
            order: categoryData.order,
          })
          .commit();
      } else {
        // Create new category
        await client.create({
          _type: "category",
          title: categoryData.title,
          slug: { _type: "slug", current: slug },
          description: categoryData.description,
          image: categoryData.image,
          parentCategory: categoryData.parentCategory ? { _type: "reference", _ref: categoryData.parentCategory } : undefined,
          order: categoryData.order,
        });
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      await fetchProducts();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCollectionModal = (collection = null) => {
    setEditingCollection(collection);
    setIsCollectionModalOpen(true);
  };

  const handleSaveCollection = async (collectionData) => {
    try {
      setIsSaving(true);

      // Generate slug from title
      const slug = collectionData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Convert product IDs to references
      const productRefs = collectionData.products.map(id => ({
        _type: "reference",
        _ref: id,
        _key: id,
      }));

      if (editingCollection && editingCollection._id) {
        // Update existing collection
        await client
          .patch(editingCollection._id)
          .set({
            title: collectionData.title,
            slug: { _type: "slug", current: slug },
            description: collectionData.description,
            image: collectionData.image,
            products: productRefs,
            featured: collectionData.featured,
          })
          .commit();
      } else {
        // Create new collection
        await client.create({
          _type: "collection",
          title: collectionData.title,
          slug: { _type: "slug", current: slug },
          description: collectionData.description,
          image: collectionData.image,
          products: productRefs,
          featured: collectionData.featured,
        });
      }

      setIsCollectionModalOpen(false);
      setEditingCollection(null);
      await fetchProducts();
    } catch (error) {
      console.error("Error saving collection:", error);
      alert("Failed to save collection");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsProductModalOpen(false);
    setIsCategoryModalOpen(false);
    setIsCollectionModalOpen(false);
    setIsColorModalOpen(false);
    setEditingProduct(null);
    setEditingCategory(null);
    setEditingCollection(null);
    setEditingColor(null);
  };

  const handleSaveColor = async (colorData) => {
    try {
      setIsSaving(true);

      // Generate slug from name
      const slug = colorData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (editingColor && editingColor._id) {
        // Update existing color
        await client
          .patch(editingColor._id)
          .set({
            name: colorData.name,
            slug: { _type: "slug", current: slug },
            hexCode: colorData.hexCode,
            description: colorData.description || "",
            colorSwatch: colorData.colorSwatch || null,
          })
          .commit();
      } else {
        // Create new color
        await client.create({
          _type: "color",
          name: colorData.name,
          slug: { _type: "slug", current: slug },
          hexCode: colorData.hexCode,
          description: colorData.description || "",
          colorSwatch: colorData.colorSwatch || null,
        });
      }

      setIsColorModalOpen(false);
      setEditingColor(null);
      await fetchProducts();
    } catch (error) {
      console.error("Error saving color:", error);
      alert("Failed to save color");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Convert description text to block array format
      const descriptionBlocks = formData.description
        ? [
            {
              _type: "block",
              _key: "block-" + Math.random().toString(36).substr(2, 9),
              style: "normal",
              children: [
                {
                  _type: "span",
                  _key: "span-" + Math.random().toString(36).substr(2, 9),
                  text: formData.description,
                  marks: [],
                },
              ],
            },
          ]
        : [];

      if (editingProduct) {
        // Convert selected categories to references
        const categoryRefs = (formData.selectedCategories || []).map(id => ({
          _type: "reference",
          _ref: id,
          _key: id,
        }));

        // Update existing product
        await client
          .patch(editingProduct._id)
          .set({
            title: formData.title,
            price: parseFloat(formData.price) || 0,
            compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
            description: descriptionBlocks,
            material: formData.material || "",
            weight: formData.weight ? parseFloat(formData.weight) : null,
            careInstructions: formData.careInstructions || "",
            sizeGuide: formData.sizeGuide || "",
            featured: formData.featured || false,
            newArrival: formData.newArrival || false,
            bestseller: formData.bestseller || false,
            categories: categoryRefs,
            availableSizes: formData.availableSizes || [],
            mainImage: formData.mainImage ? { ...formData.mainImage, alt: formData.mainImageAlt || "" } : null,
            gallery: (formData.gallery || []).map((img) => ({
              ...img,
              _key: img._key || Math.random().toString(36).substr(2, 9),
            })),
            variants: (formData.variants || []).map((v) => ({
              _type: "object",
              _key: v._key || Math.random().toString(36).substr(2, 9),
              color: v.color._id ? { _type: "reference", _ref: v.color._id } : { _type: "reference", _ref: v.color },
              sizeStock: v.sizeStock || {},
              priceAdjustment: v.priceAdjustment || 0,
            })),
            seo: {
              metaTitle: formData.metaTitle || "",
              metaDescription: formData.metaDescription || "",
            },
          })
          .commit();
      } else if (!editingCategory && !editingCollection) {
        // Create new product
        const slug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const categoryRefs = (formData.selectedCategories || []).map(id => ({
          _type: "reference",
          _ref: id,
          _key: id,
        }));

        await client.create({
          _type: "product",
          title: formData.title,
          slug: { _type: "slug", current: slug },
          price: parseFloat(formData.price) || 0,
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          description: descriptionBlocks,
          material: formData.material || "",
          weight: formData.weight ? parseFloat(formData.weight) : null,
          careInstructions: formData.careInstructions || "",
          sizeGuide: formData.sizeGuide || "",
          featured: formData.featured || false,
          newArrival: formData.newArrival || false,
          bestseller: formData.bestseller || false,
          categories: categoryRefs,
          availableSizes: formData.availableSizes || [],
          mainImage: formData.mainImage ? { ...formData.mainImage, alt: formData.mainImageAlt || "" } : null,
          gallery: (formData.gallery || []).map((img) => ({
            ...img,
            _key: img._key || Math.random().toString(36).substr(2, 9),
          })),
          variants: (formData.variants || []).map((v) => ({
            _type: "object",
            _key: v._key || Math.random().toString(36).substr(2, 9),
            color: v.color._id ? { _type: "reference", _ref: v.color._id } : { _type: "reference", _ref: v.color },
            sizeStock: v.sizeStock || {},
            priceAdjustment: v.priceAdjustment || 0,
          })),
          seo: {
            metaTitle: formData.metaTitle || "",
            metaDescription: formData.metaDescription || "",
          },
        });
      }
      handleCloseModal();
      fetchProducts();
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving data: " + error.message);
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        await client.delete(id);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            Product Management
          </h1>
          <p className="text-sm sm:text-base text-gray-400">Manage products, variants, categories & collections</p>
        </div>
        {activeTab === "products" && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/50 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        )}
        {activeTab === "categories" && (
          <button
            onClick={() => handleOpenCategoryModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/50"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        )}
        {activeTab === "collections" && (
          <button
            onClick={() => handleOpenCollectionModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/50"
          >
            <Plus className="w-5 h-5" />
            Add Collection
          </button>
        )}
        {activeTab === "colors" && (
          <button
            onClick={() => {
              setEditingColor(null);
              setIsColorModalOpen(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/50"
          >
            <Plus className="w-5 h-5" />
            Add Color
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-black/40 rounded-lg p-2 border border-white/10">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            activeTab === "products"
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <Package className="w-4 h-4" />
          Products
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            activeTab === "categories"
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <Tag className="w-4 h-4" />
          Categories
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            activeTab === "collections"
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <Folder className="w-4 h-4" />
          Collections
        </button>
        <button
          onClick={() => setActiveTab("colors")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            activeTab === "colors"
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <Palette className="w-4 h-4" />
          Colors
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4 hover:border-blue-500/50 transition-colors">
          <p className="text-gray-400 text-xs font-medium">Total Products</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{products.length}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded p-4 hover:border-purple-500/50 transition-colors">
          <p className="text-gray-400 text-xs font-medium">Categories</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{categories.length}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded p-4 hover:border-amber-500/50 transition-colors">
          <p className="text-gray-400 text-xs font-medium">Collections</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{collections.length}</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded p-4 hover:border-rose-500/50 transition-colors">
          <p className="text-gray-400 text-xs font-medium">Colors</p>
          <p className="text-3xl font-bold text-rose-400 mt-1">{colors.length}</p>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading data...</div>
      ) : activeTab === "products" ? (
        products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No products found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const totalStock = calculateTotalStock(product.variants);
              const outOfStock = isOutOfStock(product.variants);

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/30 border border-white/10 rounded overflow-hidden hover:border-blue-500/50 transition-colors group"
                >
                  {/* Image */}
                  <div className="relative w-full h-32 bg-black/60 overflow-hidden flex items-center justify-center border-b border-white/10">
                    {product.mainImage ? (
                      <img
                        src={getImageUrl(product.mainImage)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"></path></svg></div>`;
                        }}
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-600" />
                    )}
                    {product.variants?.length > 0 && (
                      <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 flex gap-1 items-center">
                        {product.variants.slice(0, 3).map((v, idx) => (
                          <div
                            key={idx}
                            className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
                            style={{ backgroundColor: v.color?.hexCode || "#999" }}
                            title={v.color?.name}
                          />
                        ))}
                        {product.variants.length > 3 && (
                          <span className="text-[10px] text-white/70 ml-0.5">+{product.variants.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-2">
                    <div>
                      <h3 className="text-white font-semibold text-sm line-clamp-1">
                        {product.title}
                      </h3>
                      {product.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {product.categories.slice(0, 1).map((cat, idx) => (
                            <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                              {cat.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Stock */}
                    <div className="text-sm space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-white">
                          ₹{(product.price || 0).toLocaleString("en-IN")}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs line-through text-gray-500">
                            ₹{(product.compareAtPrice || 0).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Stock: <span className={outOfStock ? "text-red-400" : "text-green-400"}>{totalStock}</span></span>
                        <span>Colors: <span className="text-white">{product.variants?.length || 0}</span></span>
                      </div>
                      {product.variants?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.variants.slice(0, 3).map((v, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-white/5 rounded px-1.5 py-0.5">
                              <div
                                className="w-2 h-2 rounded-full border border-white/30"
                                style={{ backgroundColor: v.color?.hexCode || "#999" }}
                              />
                              <span className="text-[10px] text-gray-300">{v.color?.name || 'Unknown'}</span>
                            </div>
                          ))}
                          {product.variants.length > 3 && (
                            <span className="text-[10px] text-gray-500 px-1">+{product.variants.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs py-1.5 rounded transition-colors font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, "product")}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs py-1.5 rounded transition-colors font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      ) : activeTab === "categories" ? (
        categories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No categories found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-black/30 border border-white/10 rounded overflow-hidden hover:border-purple-500/50 transition-colors"
              >
                {/* Category Image */}
                {category.image && (
                  <div className="w-full h-32 overflow-hidden border-b border-white/10">
                    <img
                      src={getImageUrl(category.image)}
                      alt={category.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">{category.title}</h3>
                    {category.parentCategory && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Sub</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">{category.description || "No description"}</p>
                  {category.parentCategory && (
                    <p className="text-xs text-gray-500 mb-2">Parent: {category.parentCategory.title}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Order: {category.order || 0}</span>
                    {!category.image && <span className="text-yellow-500">No image</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenCategoryModal(category)}
                      className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs py-1.5 rounded transition-colors font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, "category")}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs py-1.5 rounded transition-colors font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "collections" ? (
        collections.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No collections found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <div
                key={collection._id}
                className="bg-black/30 border border-white/10 rounded overflow-hidden hover:border-amber-500/50 transition-colors"
              >
                {/* Collection Image */}
                {collection.image && (
                  <div className="w-full h-32 overflow-hidden border-b border-white/10">
                    <img
                      src={getImageUrl(collection.image)}
                      alt={collection.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">{collection.title}</h3>
                    {collection.featured && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">⭐</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                    {collection.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Products: <span className="text-white">{collection.products?.length || 0}</span></span>
                    {!collection.image && <span className="text-yellow-500">No image</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenCollectionModal(collection)}
                      className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs py-1.5 rounded transition-colors font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(collection._id, "collection")}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs py-1.5 rounded transition-colors font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "colors" ? (
        colors.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No colors found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map((color) => (
              <div
                key={color._id}
                className="bg-black/30 border border-white/10 rounded overflow-hidden hover:border-rose-500/50 transition-colors"
              >
                {/* Color Preview */}
                <div className="flex h-24">
                  <div
                    className="w-full border-b border-white/10"
                    style={{ backgroundColor: color.hexCode }}
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">{color.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-gray-300 text-xs font-mono bg-black/40 px-2 py-1 rounded">
                      {color.hexCode.toUpperCase()}
                    </code>
                  </div>
                  {color.description && (
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {color.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingColor(color);
                        setIsColorModalOpen(true);
                      }}
                      className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs py-1.5 rounded transition-colors font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(color._id, "color")}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs py-1.5 rounded transition-colors font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}
      <ProductEditModal
        isOpen={isProductModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        formData={formData}
        onInputChange={handleInputChange}
        isEditing={!!editingProduct}
        isSaving={isSaving}
        categories={categories}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
      />

      {/* Collection Modal */}
      <CollectionModal
        isOpen={isCollectionModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCollection}
        editingCollection={editingCollection}
      />

      {/* Color Modal */}
      <ColorModal
        isOpen={isColorModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveColor}
        editingColor={editingColor}
      />
    </motion.div>
  );
}
