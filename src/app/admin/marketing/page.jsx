"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Megaphone, Edit, BarChart3, Loader } from "lucide-react";
import Modal from "../components/Modal";
import HeroSectionModal from "../components/HeroSectionModal";
import AnnouncementBarModal from "../components/AnnouncementBarModal";
import PromoCountdownModal from "../components/PromoCountdownModal";
import DiscountCodeModal from "../components/DiscountCodeModal";
import EditorialSectionModal from "../components/EditorialSectionModal";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [heroSections, setHeroSections] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [promoCountdowns, setPromoCountdowns] = useState([]);
  const [announcementBars, setAnnouncementBars] = useState([]);
  const [editorialSections, setEditorialSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [heroSaving, setHeroSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [isEditorialModalOpen, setIsEditorialModalOpen] = useState(false);
  const [editingEditorial, setEditingEditorial] = useState(null);

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    try {
      const [heroes, codes, promos, announcements, editorials] = await Promise.all([
        client.fetch(`*[_type == "heroSection"] | order(_createdAt desc) {
          _id, heading1, heading2, description, ctaText, ctaLink, backgroundImage
        }`),
        client.fetch(`*[_type == "discountCode"] | order(_createdAt desc) {
          _id, code, description, discountType, percentageOff, fixedAmountOff, 
          buyQuantity, getQuantity, getDiscountPercentage,
          minimumPurchaseAmount, maximumDiscountAmount, appliesTo,
          specificProducts, specificCategories, specificCollections,
          usageLimit, usageLimitPerCustomer, startDate, endDate, isActive, timesUsed
        }`),
        client.fetch(`*[_type == "promoCountdown"] | order(_createdAt desc) {
          _id, title, description, code, discountPercentage, endDate, isActive
        }`),
        client.fetch(`*[_type == "announcementBar"] | order(_createdAt desc) {
          _id, text, backgroundColor, textColor, isActive
        }`),
        client.fetch(`*[_type == "editorialSection"] | order(_createdAt desc) {
          _id, title, description, cta, ctaLink, image, imagePosition
        }`),
      ]);

      setHeroSections(heroes);
      setDiscountCodes(codes);
      setPromoCountdowns(promos);
      setAnnouncementBars(announcements);
      setEditorialSections(editorials);
    } catch (error) {
      console.error("Error fetching marketing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeroSection = async (heroData) => {
    try {
      setHeroSaving(true);

      if (editingHero && editingHero._id) {
        // Update existing hero section
        await client
          .patch(editingHero._id)
          .set({
            heading1: heroData.heading1,
            heading2: heroData.heading2,
            description: heroData.description,
            ctaText: heroData.ctaText,
            ctaLink: heroData.ctaLink,
            backgroundImage: heroData.backgroundImage,
          })
          .commit();
      } else {
        // Create new hero section
        await client.create({
          _type: "heroSection",
          heading1: heroData.heading1,
          heading2: heroData.heading2,
          description: heroData.description,
          ctaText: heroData.ctaText,
          ctaLink: heroData.ctaLink,
          backgroundImage: heroData.backgroundImage,
        });
      }

      setIsHeroModalOpen(false);
      setEditingHero(null);
      await fetchMarketingData();
    } catch (error) {
      console.error("Error saving hero section:", error);
      alert("Failed to save hero section");
    } finally {
      setHeroSaving(false);
    }
  };

  const handleDeleteHeroSection = async (id) => {
    if (confirm("Are you sure you want to delete this hero section?")) {
      try {
        await client.delete(id);
        await fetchMarketingData();
      } catch (error) {
        console.error("Error deleting hero section:", error);
        alert("Failed to delete hero section");
      }
    }
  };

  const handleSaveAnnouncementBar = async (announcementData) => {
    try {
      if (editingAnnouncement && editingAnnouncement._id) {
        // Update existing announcement bar
        await client
          .patch(editingAnnouncement._id)
          .set({
            text: announcementData.text,
            code: announcementData.code,
            codeColor: announcementData.codeColor,
            active: announcementData.active,
            order: announcementData.order,
          })
          .commit();
      } else {
        // Create new announcement bar
        await client.create({
          _type: "announcementBar",
          text: announcementData.text,
          code: announcementData.code,
          codeColor: announcementData.codeColor,
          active: announcementData.active,
          order: announcementData.order,
        });
      }

      setIsAnnouncementModalOpen(false);
      setEditingAnnouncement(null);
      await fetchMarketingData();
    } catch (error) {
      console.error("Error saving announcement bar:", error);
      alert("Failed to save announcement bar");
    }
  };

  const handleSavePromoCountdown = async (promoData) => {
    try {
      if (editingPromo && editingPromo._id) {
        // Update existing promo countdown
        await client
          .patch(editingPromo._id)
          .set({
            title: promoData.title,
            subtitle: promoData.subtitle,
            description: promoData.description,
            code: promoData.code,
            discountPercentage: promoData.discountPercentage,
            backgroundImage: promoData.backgroundImage,
            active: promoData.active,
            endDate: promoData.endDate,
          })
          .commit();
      } else {
        // Create new promo countdown
        await client.create({
          _type: "promoCountdown",
          title: promoData.title,
          subtitle: promoData.subtitle,
          description: promoData.description,
          code: promoData.code,
          discountPercentage: promoData.discountPercentage,
          backgroundImage: promoData.backgroundImage,
          active: promoData.active,
          endDate: promoData.endDate,
        });
      }

      setIsPromoModalOpen(false);
      setEditingPromo(null);
      await fetchMarketingData();
    } catch (error) {
      console.error("Error saving promo countdown:", error);
      alert("Failed to save promo countdown");
    }
  };

  const handleSaveDiscountCode = async (discountData) => {
    try {
      if (editingDiscount && editingDiscount._id) {
        // Update existing discount code
        await client
          .patch(editingDiscount._id)
          .set({
            code: discountData.code,
            description: discountData.description,
            discountType: discountData.discountType,
            percentageOff: discountData.percentageOff,
            fixedAmountOff: discountData.fixedAmountOff,
            buyQuantity: discountData.buyQuantity,
            getQuantity: discountData.getQuantity,
            getDiscountPercentage: discountData.getDiscountPercentage,
            minimumPurchaseAmount: discountData.minimumPurchaseAmount,
            maximumDiscountAmount: discountData.maximumDiscountAmount,
            appliesTo: discountData.appliesTo,
            specificProducts: discountData.specificProducts,
            specificCategories: discountData.specificCategories,
            specificCollections: discountData.specificCollections,
            usageLimit: discountData.usageLimit,
            usageLimitPerCustomer: discountData.usageLimitPerCustomer,
            startDate: discountData.startDate,
            endDate: discountData.endDate,
            isActive: discountData.isActive,
          })
          .commit();
      } else {
        // Create new discount code
        await client.create({
          _type: "discountCode",
          code: discountData.code,
          description: discountData.description,
          discountType: discountData.discountType,
          percentageOff: discountData.percentageOff,
          fixedAmountOff: discountData.fixedAmountOff,
          buyQuantity: discountData.buyQuantity,
          getQuantity: discountData.getQuantity,
          getDiscountPercentage: discountData.getDiscountPercentage,
          minimumPurchaseAmount: discountData.minimumPurchaseAmount,
          maximumDiscountAmount: discountData.maximumDiscountAmount,
          appliesTo: discountData.appliesTo,
          specificProducts: discountData.specificProducts,
          specificCategories: discountData.specificCategories,
          specificCollections: discountData.specificCollections,
          usageLimit: discountData.usageLimit,
          usageLimitPerCustomer: discountData.usageLimitPerCustomer,
          startDate: discountData.startDate,
          endDate: discountData.endDate,
          isActive: discountData.isActive,
          timesUsed: 0,
        });
      }

      setIsDiscountModalOpen(false);
      setEditingDiscount(null);
      await fetchMarketingData();
    } catch (error) {
      console.error("Error saving discount code:", error);
      alert("Failed to save discount code");
    }
  };

  const handleSaveEditorialSection = async (editorialData) => {
    try {
      if (editingEditorial && editingEditorial._id) {
        // Update existing editorial section
        await client
          .patch(editingEditorial._id)
          .set({
            title: editorialData.title,
            description: editorialData.description,
            cta: editorialData.cta,
            ctaLink: editorialData.ctaLink,
            image: editorialData.image,
            imagePosition: editorialData.imagePosition,
          })
          .commit();
      } else {
        // Create new editorial section
        await client.create({
          _type: "editorialSection",
          title: editorialData.title,
          description: editorialData.description,
          cta: editorialData.cta,
          ctaLink: editorialData.ctaLink,
          image: editorialData.image,
          imagePosition: editorialData.imagePosition,
        });
      }

      setIsEditorialModalOpen(false);
      setEditingEditorial(null);
      await fetchMarketingData();
    } catch (error) {
      console.error("Error saving editorial section:", error);
      alert("Failed to save editorial section");
    }
  };

  const handleOpenModal = (item = null, type = "hero") => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await client.delete(id);
        fetchMarketingData();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const tabs = [
    { id: "hero", label: "Hero Section", icon: "🎬" },
    { id: "announcement", label: "Announcement Bar", icon: "📢" },
    { id: "promo", label: "Promo Countdown", icon: "⏱️" },
    { id: "discount", label: "Discount Codes", icon: "🏷️" },
    { id: "editorial", label: "Editorial Sections", icon: "📰" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-blue-400" />
          Marketing Management
        </h1>
        <p className="text-gray-400">Manage all marketing content and promotions</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-black/40 rounded-lg p-2 border border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading marketing data...</div>
      ) : (
        <>
          {/* Hero Section */}
          {activeTab === "hero" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Hero Sections</h2>
                <button
                  onClick={() => {
                    setEditingHero(null);
                    setIsHeroModalOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Create New
                </button>
              </div>

              {heroSections.length > 0 ? (
                <div className="grid gap-4">
                  {heroSections.map((hero) => (
                    <div
                      key={hero._id}
                      className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
                    >
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Content */}
                        <div className="md:col-span-2 space-y-4">
                          <div>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
                              Heading 1
                            </p>
                            <p className="text-white text-2xl font-bold">{hero.heading1}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
                              Heading 2
                            </p>
                            <p className="text-white text-2xl font-bold">{hero.heading2}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
                              Description
                            </p>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {hero.description}
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
                                CTA Text
                              </p>
                              <p className="text-blue-400">{hero.ctaText}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
                                CTA Link
                              </p>
                              <p className="text-blue-400 text-sm">{hero.ctaLink}</p>
                            </div>
                          </div>
                        </div>

                        {/* Image Preview */}
                        <div>
                          {hero.backgroundImage ? (
                            <div className="w-full h-40 bg-black/40 border border-white/20 rounded overflow-hidden">
                              <img
                                src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${hero.backgroundImage.asset._ref.replace("image-", "").replace("-jpg", ".jpg").replace("-png", ".png")}`}
                                alt="Hero"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/300x200?text=Hero+Image";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-40 bg-black/40 border border-white/20 rounded flex items-center justify-center">
                              <p className="text-gray-500 text-xs">No image</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={() => {
                            setEditingHero(hero);
                            setIsHeroModalOpen(true);
                          }}
                          className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded text-sm font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHeroSection(hero._id)}
                          className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-sm font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center">
                  <p className="text-gray-400 mb-4">
                    No hero sections created yet. Create one to get started!
                  </p>
                  <button
                    onClick={() => {
                      setEditingHero(null);
                      setIsHeroModalOpen(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Create First Hero Section
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Announcement Bar */}
          {activeTab === "announcement" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Announcement Bars</h2>
                <button
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setIsAnnouncementModalOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Create New
                </button>
              </div>
              <div className="grid gap-4">
                {announcementBars.map((bar) => (
                  <div
                    key={bar._id}
                    className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg p-4 flex justify-between items-center"
                    style={{
                      backgroundColor: bar.backgroundColor || "transparent",
                      opacity: 0.9,
                    }}
                  >
                    <div className="flex-1">
                      <p
                        style={{ color: bar.textColor || "white" }}
                        className="font-semibold"
                      >
                        {bar.text}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAnnouncement(bar);
                          setIsAnnouncementModalOpen(true);
                        }}
                        className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-3 py-1.5 rounded font-semibold text-sm transition-colors inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bar._id)}
                        className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {announcementBars.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No announcement bars</div>
                )}
              </div>
            </div>
          )}

          {/* Promo Countdown */}
          {activeTab === "promo" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Promo Countdowns</h2>
                <button
                  onClick={() => {
                    setEditingPromo(null);
                    setIsPromoModalOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Create New
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {promoCountdowns.map((promo) => (
                  <div
                    key={promo._id}
                    className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-white font-semibold">{promo.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          promo.isActive
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {promo.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{promo.description}</p>
                    <p className="text-white font-bold mb-2">
                      {promo.discountPercentage}% OFF
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Ends: {new Date(promo.endDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPromo(promo);
                          setIsPromoModalOpen(true);
                        }}
                        className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-3 py-1.5 rounded font-semibold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promo._id)}
                        className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {promoCountdowns.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-400">
                    No promo countdowns
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Discount Codes */}
          {activeTab === "discount" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Discount Codes</h2>
                <button
                  onClick={() => {
                    setEditingDiscount(null);
                    setIsDiscountModalOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Create New
                </button>
              </div>
              <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/60 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                          Code
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                          Discount
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                          Min Purchase
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                          Usage
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                          Expires
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {discountCodes.map((code) => (
                        <tr key={code._id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-6 py-4 text-white font-mono font-semibold">
                            {code.code}
                          </td>
                          <td className="px-6 py-4 text-white">
                            {code.discountType === "percentage" ? (
                              <span>{code.percentageOff}%</span>
                            ) : code.discountType === "fixed" ? (
                              <span>₹{(code.fixedAmountOff || 0).toLocaleString("en-IN")}</span>
                            ) : code.discountType === "freeShipping" ? (
                              <span>Free Shipping</span>
                            ) : (
                              <span>Buy {code.buyQuantity} Get {code.getQuantity}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {code.minimumPurchaseAmount > 0 ? `₹${code.minimumPurchaseAmount.toLocaleString("en-IN")}` : "None"}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {code.timesUsed || 0} / {code.usageLimit || "∞"}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {code.endDate ? new Date(code.endDate).toLocaleDateString() : "No expiry"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                code.isActive
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {code.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingDiscount(code);
                                  setIsDiscountModalOpen(true);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(code._id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {discountCodes.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No discount codes</div>
                )}
              </div>
            </div>
          )}

          {/* Editorial Sections */}
          {activeTab === "editorial" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Editorial Sections</h2>
                <button
                  onClick={() => {
                    setEditingEditorial(null);
                    setIsEditorialModalOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Create New
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {editorialSections.map((editorial) => (
                  <div
                    key={editorial._id}
                    className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
                  >
                    {editorial.image && (
                      <div className="w-full h-40 overflow-hidden">
                        <img
                          src={`https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${editorial.image.asset._ref.split('-')[1]}-${editorial.image.asset._ref.split('-')[2]}.${editorial.image.asset._ref.split('-')[3]}`}
                          alt={editorial.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2">{editorial.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {editorial.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <span>Position: {editorial.imagePosition || 'left'}</span>
                        <span>•</span>
                        <span>CTA: {editorial.cta || 'Discover More'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingEditorial(editorial);
                            setIsEditorialModalOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(editorial._id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {editorialSections.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-400">
                    No editorial sections
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Hero Section Modal */}
      <HeroSectionModal
        isOpen={isHeroModalOpen}
        onClose={() => {
          setIsHeroModalOpen(false);
          setEditingHero(null);
        }}
        heroData={editingHero}
        isEditing={!!editingHero}
        onSave={handleSaveHeroSection}
      />

      {/* Announcement Bar Modal */}
      <AnnouncementBarModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => {
          setIsAnnouncementModalOpen(false);
          setEditingAnnouncement(null);
        }}
        announcementData={editingAnnouncement}
        isEditing={!!editingAnnouncement}
        onSave={handleSaveAnnouncementBar}
      />

      {/* Promo Countdown Modal */}
      <PromoCountdownModal
        isOpen={isPromoModalOpen}
        onClose={() => {
          setIsPromoModalOpen(false);
          setEditingPromo(null);
        }}
        promoData={editingPromo}
        isEditing={!!editingPromo}
        onSave={handleSavePromoCountdown}
      />

      {/* Discount Code Modal */}
      <DiscountCodeModal
        isOpen={isDiscountModalOpen}
        onClose={() => {
          setIsDiscountModalOpen(false);
          setEditingDiscount(null);
        }}
        editingCode={editingDiscount}
        onSave={handleSaveDiscountCode}
      />

      {/* Editorial Section Modal */}
      <EditorialSectionModal
        isOpen={isEditorialModalOpen}
        onClose={() => {
          setIsEditorialModalOpen(false);
          setEditingEditorial(null);
        }}
        editingSection={editingEditorial}
        onSave={handleSaveEditorialSection}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Edit Marketing Content"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            📝 Edit marketing content in Sanity Studio for full control over all fields, images, and references.
          </p>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={handleCloseModal}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Open in Studio
            </button>
            <button
              onClick={handleCloseModal}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
