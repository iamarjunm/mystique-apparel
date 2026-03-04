"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Settings, Save, RefreshCw, Truck, Gamepad2, Loader } from "lucide-react";

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: "",
    tagline: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    country: "",
    currency: "INR",
    shippingSettings: {
      shippingEnabled: true,
      freeShippingThreshold: 0,
      standardShippingCost: 0,
    },
    promotionalGames: {
      enabled: true,
      activeGame: "mystery-box",
      offerCycleId: `cycle_${Date.now()}`,
      autoOpenDelay: 3,
      showFloatingButton: true,
      replayInterval: 24,
    },
  });

  const gameOptions = [
    { value: "mystery-box", label: "Mystery Box", description: "9 mystery boxes to open" },
    { value: "scratch-card", label: "Scratch Card", description: "Scratch to reveal your prize" },
    { value: "lucky-wheel", label: "Lucky Wheel", description: "Spin the lucky wheel" },
    { value: "card-flip", label: "Card Flip", description: "Match the cards" },
    { value: "number-guess", label: "Number Guess", description: "Guess the number" },
    { value: "neon-vault", label: "Neon Vault", description: "Memory heist: repeat secret light sequences" },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "siteSettings"][0] {
            _id,
            siteName,
            tagline,
            contactEmail,
            contactPhone,
            address,
            city,
            country,
            currency,
            shippingSettings,
            promotionalGames,
            updatedAt
          }`
        );
        if (data) {
          setSettings(data);
          setFormData(data);
        } else {
          // Create document if it doesn't exist
          const newDoc = await client.create({
            _type: "siteSettings",
            siteName: "",
            tagline: "",
            contactEmail: "",
            contactPhone: "",
            address: "",
            city: "",
            country: "",
            currency: "INR",
            shippingSettings: {
              shippingEnabled: true,
              freeShippingThreshold: 0,
              standardShippingCost: 0,
            },
            promotionalGames: {
              enabled: true,
              activeGame: "mystery-box",
              offerCycleId: `cycle_${Date.now()}`,
              autoOpenDelay: 3,
              showFloatingButton: true,
              replayInterval: 24,
            },
          });
          setSettings(newDoc);
          setFormData(newDoc);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNestedChange = (section, field, value, type = "string") => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: type === "checkbox" ? value : type === "number" ? parseFloat(value) || 0 : value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (settings?._id) {
        const nextFormData = { ...formData };
        const previousGame = settings?.promotionalGames?.activeGame;
        const selectedGame = formData?.promotionalGames?.activeGame;

        // New campaign cycle whenever active game changes
        if (previousGame && selectedGame && previousGame !== selectedGame) {
          nextFormData.promotionalGames = {
            ...formData.promotionalGames,
            offerCycleId: `cycle_${Date.now()}`,
          };
        } else if (!formData?.promotionalGames?.offerCycleId) {
          nextFormData.promotionalGames = {
            ...formData.promotionalGames,
            offerCycleId: `cycle_${Date.now()}`,
          };
        }

        await client
          .patch(settings._id)
          .set(nextFormData)
          .commit();
        
        // Refetch the data to show the same data
        const updatedData = await client.fetch(
          `*[_type == "siteSettings"][0] {
            _id,
            siteName,
            tagline,
            contactEmail,
            contactPhone,
            address,
            city,
            country,
            currency,
            shippingSettings,
            promotionalGames,
            updatedAt
          }`
        );
        
        if (updatedData) {
          setSettings(updatedData);
          setFormData(updatedData);
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Settings document not found. Please refresh the page.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings: " + error.message);
    } finally {
      setIsSaving(false);
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          Site Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-400">Manage your store configuration, shipping, and promotional games</p>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg p-1.5 sm:p-2 flex gap-1.5 sm:gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 min-w-max py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base transition-all ${
            activeTab === "general"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          General
        </button>
        <button
          onClick={() => setActiveTab("shipping")}
          className={`flex-1 min-w-max py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === "shipping"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Truck className="w-4 h-4 inline mr-2" />
          Shipping
        </button>
        <button
          onClick={() => setActiveTab("games")}
          className={`flex-1 min-w-max py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === "games"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Gamepad2 className="w-4 h-4 inline mr-2" />
          Games
        </button>
      </div>

      {/* Settings Form */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg p-4 sm:p-6 md:p-8">
        {loading ? (
          <div className="text-center text-gray-400 text-sm sm:text-base">Loading settings...</div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">General Settings</h2>
                {/* Store Information */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Store Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        name="siteName"
                        value={formData.siteName || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your site name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="contact@site.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency || "INR"}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="INR">₹ Indian Rupee</option>
                        <option value="USD">$ US Dollar</option>
                        <option value="EUR">€ Euro</option>
                        <option value="GBP">£ British Pound</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 mt-8">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SHIPPING TAB */}
            {activeTab === "shipping" && (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">Shipping Settings</h2>
                <div className="space-y-6">
                  {/* Enable Shipping */}
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shippingSettings?.shippingEnabled ?? true}
                        onChange={(e) =>
                          handleNestedChange("shippingSettings", "shippingEnabled", e.target.checked, "checkbox")
                        }
                        className="w-5 h-5 accent-blue-500"
                      />
                      <span className="text-lg font-semibold text-white">Enable Shipping Charges</span>
                    </label>
                    <p className="text-gray-400 text-sm mt-2 ml-8">
                      {formData.shippingSettings?.shippingEnabled
                        ? "✓ Shipping charges are currently ENABLED"
                        : "✗ Shipping charges are currently DISABLED (all orders have free shipping)"}
                    </p>
                  </div>

                  {formData.shippingSettings?.shippingEnabled && (
                    <>
                      {/* Standard Shipping Cost */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Standard Shipping Cost
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl text-gray-400">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.shippingSettings?.standardShippingCost ?? 0}
                            onChange={(e) =>
                              handleNestedChange("shippingSettings", "standardShippingCost", e.target.value, "number")
                            }
                            className="flex-1 px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <p className="text-gray-500 text-xs mt-2">Charge per order for shipping</p>
                      </div>

                      {/* Free Shipping Threshold */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Free Shipping Threshold
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl text-gray-400">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.shippingSettings?.freeShippingThreshold ?? 0}
                            onChange={(e) =>
                              handleNestedChange("shippingSettings", "freeShippingThreshold", e.target.value, "number")
                            }
                            className="flex-1 px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <p className="text-gray-500 text-xs mt-2">Orders above this amount get free shipping (set to 0 to disable)</p>
                      </div>
                    </>
                  )}

                  <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      💡 These settings are automatically applied to the checkout page during order calculation.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* GAMES TAB */}
            {activeTab === "games" && (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">Promotional Games</h2>
                <div className="space-y-6">
                  {/* Enable Games */}
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.promotionalGames?.enabled ?? true}
                        onChange={(e) =>
                          handleNestedChange("promotionalGames", "enabled", e.target.checked, "checkbox")
                        }
                        className="w-5 h-5 accent-blue-500"
                      />
                      <span className="text-lg font-semibold text-white">Enable Promotional Games</span>
                    </label>
                    <p className="text-gray-400 text-sm mt-2 ml-8">
                      Games will {formData.promotionalGames?.enabled ? "be shown" : "not be shown"} on the homepage
                    </p>
                  </div>

                  {formData.promotionalGames?.enabled && (
                    <>
                      {/* Select Active Game */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-4">
                          Select Active Game
                        </label>
                        <div className="space-y-3">
                          {gameOptions.map((game) => (
                            <label
                              key={game.value}
                              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                formData.promotionalGames?.activeGame === game.value
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                              }`}
                            >
                              <input
                                type="radio"
                                name="activeGame"
                                value={game.value}
                                checked={formData.promotionalGames?.activeGame === game.value}
                                onChange={(e) =>
                                  handleNestedChange("promotionalGames", "activeGame", e.target.value)
                                }
                                className="w-4 h-4 accent-blue-500"
                              />
                              <div>
                                <p className="font-semibold text-white">{game.label}</p>
                                <p className="text-sm text-gray-400">{game.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Auto-Open Delay */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Auto-Open Delay (seconds)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={formData.promotionalGames?.autoOpenDelay ?? 3}
                          onChange={(e) =>
                            handleNestedChange("promotionalGames", "autoOpenDelay", e.target.value, "number")
                          }
                          className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="3"
                        />
                        <p className="text-gray-500 text-xs mt-2">How long after page load to auto-open the game (0 = disabled)</p>
                      </div>

                      {/* Show Floating Button */}
                      <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.promotionalGames?.showFloatingButton ?? true}
                            onChange={(e) =>
                              handleNestedChange("promotionalGames", "showFloatingButton", e.target.checked, "checkbox")
                            }
                            className="w-5 h-5 accent-blue-500"
                          />
                          <span className="text-lg font-semibold text-white">Show Floating Diamond Button</span>
                        </label>
                        <p className="text-gray-400 text-sm mt-2 ml-8">
                          Users can click the 💎 button anytime to play the game
                        </p>
                      </div>

                      {/* Replay Interval */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Replay Interval (hours)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="720"
                          value={formData.promotionalGames?.replayInterval ?? 24}
                          onChange={(e) =>
                            handleNestedChange("promotionalGames", "replayInterval", e.target.value, "number")
                          }
                          className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="24"
                        />
                        <p className="text-gray-500 text-xs mt-2">Hours before user can play again (0 = one-time per account/device)</p>
                      </div>
                    </>
                  )}

                  <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      💡 Games automatically generate discount codes and save them to Sanity. Each user can only play ONCE per configured interval.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
              {saveSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <span className="text-green-200">✓ Saved successfully</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-300 mb-3">⚙️ Settings Information</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>All changes are saved immediately to Sanity and applied live</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Shipping settings affect the checkout page automatically</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Game settings control which game is displayed and when</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Each user can play games based on the configured replay interval</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
