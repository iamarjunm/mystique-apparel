"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Settings, Save, X } from "lucide-react";
import Modal from "../components/Modal";

export default function GameSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    enabled: true,
    activeGame: "mystery-box",
    autoOpenDelay: 3,
    showFloatingButton: true,
    replayInterval: 24,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const gameOptions = [
    { value: "mystery-box", label: "Mystery Box", description: "9 mystery boxes to open" },
    { value: "scratch-card", label: "Scratch Card", description: "Scratch to reveal your prize" },
    { value: "lucky-wheel", label: "Lucky Wheel", description: "Spin the lucky wheel" },
    { value: "card-flip", label: "Card Flip", description: "Match the cards" },
    { value: "number-guess", label: "Number Guess", description: "Guess the number" },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await client.fetch(
        `*[_type == "siteSettings"][0] {
          _id,
          promotionalGames {
            enabled,
            activeGame,
            autoOpenDelay,
            showFloatingButton,
            replayInterval
          }
        }`
      );

      if (data && data.promotionalGames) {
        setFormData(data.promotionalGames);
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
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) : value,
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updateData = {
        _id: settings._id,
        _type: "siteSettings",
        promotionalGames: formData,
      };

      await client.patch(settings._id).set({ promotionalGames: formData }).commit();

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
          <Settings className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text">
            Game Settings
          </h1>
        </div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-2xl border border-purple-500/30 p-8 space-y-8"
        >
          {/* Enable/Disable Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={formData.enabled}
                onChange={handleInputChange}
                className="w-5 h-5 cursor-pointer"
              />
              <label htmlFor="enabled" className="cursor-pointer">
                Enable Promotional Games
              </label>
            </h2>
            <p className="text-gray-400 text-sm">
              Toggle to show or hide promotional games on the homepage.
            </p>
          </div>

          {formData.enabled && (
            <>
              {/* Game Selection */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-white">Select Active Game</label>
                <div className="grid grid-cols-1 gap-3">
                  {gameOptions.map((game) => (
                    <label
                      key={game.value}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer"
                      style={{
                        borderColor:
                          formData.activeGame === game.value ? "#06b6d4" : "#7c3aed",
                        backgroundColor:
                          formData.activeGame === game.value
                            ? "rgba(6, 182, 212, 0.1)"
                            : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="activeGame"
                        value={game.value}
                        checked={formData.activeGame === game.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <p className="font-medium text-white">{game.label}</p>
                        <p className="text-sm text-gray-400">{game.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Auto-Open Delay */}
              <div className="space-y-4">
                <label htmlFor="autoOpenDelay" className="text-lg font-semibold text-white">
                  Auto-Open Delay
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    id="autoOpenDelay"
                    name="autoOpenDelay"
                    min="0"
                    max="60"
                    value={formData.autoOpenDelay}
                    onChange={handleInputChange}
                    className="w-20 px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white text-center"
                  />
                  <span className="text-gray-400">seconds after page load (0 = disable auto-open)</span>
                </div>
              </div>

              {/* Show Floating Button */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showFloatingButton"
                    name="showFloatingButton"
                    checked={formData.showFloatingButton}
                    onChange={handleInputChange}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <label htmlFor="showFloatingButton" className="cursor-pointer">
                    Show Floating Button
                  </label>
                </h2>
                <p className="text-gray-400 text-sm">
                  Display the floating diamond button to allow users to open the game anytime.
                </p>
              </div>

              {/* Replay Interval */}
              <div className="space-y-4">
                <label htmlFor="replayInterval" className="text-lg font-semibold text-white">
                  Replay Interval
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    id="replayInterval"
                    name="replayInterval"
                    min="0"
                    max="720"
                    value={formData.replayInterval}
                    onChange={handleInputChange}
                    className="w-20 px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white text-center"
                  />
                  <span className="text-gray-400">hours before user can play again (0 = once per session)</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-cyan-200 text-sm">
                  💡 <strong>Tip:</strong> Set replay interval to 0 to allow unlimited plays. Set to 24 for once per day.
                </p>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="flex gap-3 pt-4 border-t border-purple-500/30">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>

            {saveSuccess && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                <span className="text-green-200">✓ Settings saved successfully</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Game Preview Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎁 Mystery Box</h3>
            <p className="text-gray-300 text-sm">
              Players pick from 9 mysterious boxes to reveal their discount. Perfect for increasing excitement!
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎫 Scratch Card</h3>
            <p className="text-gray-300 text-sm">
              Scratch the card to reveal a hidden discount. Interactive and engaging!
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎡 Lucky Wheel</h3>
            <p className="text-gray-300 text-sm">
              Spin the colorful wheel to win discounts. Classic and visually appealing!
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🃏 Card Flip</h3>
            <p className="text-gray-300 text-sm">
              Match pairs of cards to complete the game. Great for brand building!
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🔢 Number Guess</h3>
            <p className="text-gray-300 text-sm">
              Guess the secret number between 1-100. Rewarding accuracy!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
