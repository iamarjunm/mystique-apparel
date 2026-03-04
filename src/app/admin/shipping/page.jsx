"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Truck, Save, X } from "lucide-react";

export default function ShippingSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    shippingEnabled: true,
    freeShippingThreshold: 0,
    standardShippingCost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await client.fetch(
        `*[_type == "siteSettings"][0] {
          _id,
          shippingSettings {
            shippingEnabled,
            freeShippingThreshold,
            standardShippingCost
          }
        }`
      );

      if (data && data.shippingSettings) {
        setFormData(data.shippingSettings);
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await client.patch(settings._id).set({ shippingSettings: formData }).commit();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Truck className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text">
            Shipping Settings
          </h1>
        </div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-2xl border border-purple-500/30 p-8 space-y-8"
        >
          {/* Enable/Disable Shipping */}
          <div className="space-y-4 bg-slate-700/30 p-6 rounded-xl border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <input
                type="checkbox"
                id="shippingEnabled"
                name="shippingEnabled"
                checked={formData.shippingEnabled}
                onChange={handleInputChange}
                className="w-5 h-5 cursor-pointer accent-cyan-400"
              />
              <label htmlFor="shippingEnabled" className="cursor-pointer">
                Enable Shipping Charges
              </label>
            </h2>
            <p className="text-gray-400 text-sm ml-8">
              {formData.shippingEnabled
                ? "✓ Shipping charges are currently ENABLED. Customers will be charged for shipping."
                : "✗ Shipping charges are currently DISABLED. All shipping is free."}
            </p>
          </div>

          {formData.shippingEnabled && (
            <>
              {/* Standard Shipping Cost */}
              <div className="space-y-4">
                <label htmlFor="standardShippingCost" className="text-lg font-semibold text-white block">
                  Standard Shipping Cost
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <span className="text-2xl text-gray-300 mr-2">₹</span>
                    <input
                      type="number"
                      id="standardShippingCost"
                      name="standardShippingCost"
                      min="0"
                      step="0.01"
                      value={formData.standardShippingCost}
                      onChange={handleInputChange}
                      className="w-32 px-4 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white text-center font-semibold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <span className="text-gray-400">per order</span>
                </div>
                <p className="text-gray-500 text-sm">This is the base shipping cost charged for all orders (unless free shipping threshold is met).</p>
              </div>

              {/* Free Shipping Threshold */}
              <div className="space-y-4">
                <label htmlFor="freeShippingThreshold" className="text-lg font-semibold text-white block">
                  Free Shipping Threshold
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <span className="text-2xl text-gray-300 mr-2">₹</span>
                    <input
                      type="number"
                      id="freeShippingThreshold"
                      name="freeShippingThreshold"
                      min="0"
                      step="0.01"
                      value={formData.freeShippingThreshold}
                      onChange={handleInputChange}
                      className="w-32 px-4 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white text-center font-semibold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <span className="text-gray-400">and above = free shipping</span>
                </div>
                <p className="text-gray-500 text-sm">
                  {formData.freeShippingThreshold === 0
                    ? "Set to 0 to disable free shipping threshold. Customers always pay shipping cost."
                    : `Orders over ₹${formData.freeShippingThreshold} qualify for free shipping.`}
                </p>
              </div>

              {/* Preview */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 space-y-3">
                <h3 className="text-cyan-200 font-semibold">📋 Shipping Preview</h3>
                <div className="space-y-2 text-sm text-cyan-100">
                  <div className="flex justify-between">
                    <span>Standard Shipping Cost:</span>
                    <span className="font-semibold">₹{formData.standardShippingCost.toFixed(2)}</span>
                  </div>
                  {formData.freeShippingThreshold > 0 && (
                    <div className="flex justify-between pt-2 border-t border-cyan-500/30">
                      <span>Free Shipping Threshold:</span>
                      <span className="font-semibold">₹{formData.freeShippingThreshold.toFixed(2)}</span>
                    </div>
                  )}
                  <p className="text-xs text-cyan-200 pt-2">
                    💡 This setting is automatically applied to the checkout page during order calculation.
                  </p>
                </div>
              </div>
            </>
          )}

          {!formData.shippingEnabled && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <p className="text-green-200 text-sm">
                ✓ All orders will have FREE SHIPPING. The fields below are ignored while shipping is disabled.
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3 pt-4 border-t border-purple-500/30">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Shipping Settings"}
            </button>

            {saveSuccess && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                <span className="text-green-200">✓ Settings saved successfully</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🚚 Default Behavior</h3>
            <p className="text-gray-300 text-sm">
              When shipping is enabled, the standard cost applies to all orders unless the free shipping threshold is met.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">💰 Discount Integration</h3>
            <p className="text-gray-300 text-sm">
              Discount codes can also provide free shipping. This will override shipping cost regardless of settings.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">📦 Quick Tips</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Set cost to ₹0 to offer free shipping by default</li>
              <li>• Use threshold for volume incentives</li>
              <li>• Toggle OFF to surprise customers with free shipping</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🔄 Live Updates</h3>
            <p className="text-gray-300 text-sm">
              All changes are applied immediately to the checkout page. No cache clearing needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
