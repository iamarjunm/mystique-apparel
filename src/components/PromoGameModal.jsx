"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { client } from "@/sanity";

export default function PromoGameModal({ isOpen, onClose }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [discountCode, setDiscountCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [revealedBoxes, setRevealedBoxes] = useState(new Set());

  const rewards = [
    { discount: 10, label: "10% OFF" },
    { discount: 15, label: "15% OFF" },
    { discount: 20, label: "20% OFF" },
    { discount: 5, label: "5% OFF" },
    { discount: 25, label: "25% OFF" },
    { discount: 12, label: "12% OFF" },
    { discount: 30, label: "LUCKY 30%!" },
    { discount: 18, label: "18% OFF" },
    { discount: 8, label: "FREE SHIP" },
  ];

  const generateDiscountCode = async (discountPercent) => {
    try {
      setLoading(true);

      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "MYSTIQUE";
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const discountDoc = await client.create({
        _type: "discountCode",
        code: code,
        discountType: "percentage",
        percentageOff: discountPercent,
        minimumPurchaseAmount: 0,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: 1,
        isActive: true,
        description: `Mystery Box reward - ${discountPercent}% off`,
      });

      setDiscountCode({
        code: code,
        discount: discountPercent,
        docId: discountDoc._id,
      });
    } catch (error) {
      console.error("Error creating discount code:", error);
      setDiscountCode({
        code: `MYSTIQUE${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        discount: discountPercent,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = async (index) => {
    if (revealedBoxes.has(index) || isRevealing) return;

    setSelectedBox(index);
    setIsRevealing(true);

    setTimeout(() => {
      const reward = rewards[index];
      setSelectedReward(reward);
      setRevealedBoxes(new Set([...revealedBoxes, index]));
      generateDiscountCode(reward.discount);
      setIsRevealing(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    if (discountCode?.code) {
      navigator.clipboard.writeText(discountCode.code);
      alert("Code copied to clipboard!");
    }
  };

  const playAgain = () => {
    setGameStarted(false);
    setSelectedReward(null);
    setDiscountCode(null);
    setSelectedBox(null);
    setRevealedBoxes(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative max-w-2xl w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 hover:bg-white/10 rounded-lg transition-colors group"
        >
          <X className="w-6 h-6 text-gray-300 group-hover:text-white" />
        </button>

        {/* Main Container */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl">
          {/* Luxury Gradient Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

          <div className="relative p-8 md:p-12">
            {!gameStarted ? (
              // Welcome Screen
              <div className="text-center space-y-8">
                {/* Header */}
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/50 mx-auto">
                    <span className="text-3xl">💎</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-light tracking-wider text-white">
                    MYSTIQUE
                  </h1>
                  <h2 className="text-2xl font-light text-purple-300">Mystery Rewards</h2>
                </div>

                {/* Description */}
                <div className="space-y-3 max-w-md mx-auto">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Unlock exclusive discounts by revealing your mystery gift. Every box contains a special surprise waiting for you.
                  </p>
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                  <p className="text-gray-400 text-xs uppercase tracking-widest">
                    Gifts up to 30% OFF
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setGameStarted(true)}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-light tracking-wider text-white uppercase text-sm overflow-hidden rounded-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-100 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity blur-lg" />
                  <span className="relative flex items-center gap-2">
                    REVEAL YOUR GIFT
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
              </div>
            ) : selectedReward ? (
              // Results Screen
              <div className="text-center space-y-8">
                {/* Congratulations */}
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-400/30 border border-yellow-400/50 mx-auto">
                    <span className="text-5xl animate-pulse">✨</span>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm uppercase tracking-widest mb-2">Congratulations</p>
                    <p className="text-5xl font-light tracking-tight bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                      {selectedReward.label}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

                {/* Code Section */}
                {discountCode && (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Your Exclusive Code</p>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                      <div className="relative bg-slate-900/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                        <code className="text-3xl font-light tracking-[0.3em] text-transparent bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text font-mono">
                          {discountCode.code}
                        </code>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-3">
                          {discountCode.discount}% discount • Valid 7 days
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="w-full px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white/70 hover:text-white rounded-lg transition-all text-sm font-light tracking-wide"
                    >
                      {selectedReward.discount === 5 ? "📦 FREE SHIPPING" : "Copy Code"}
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-xs">Activating your reward...</span>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={playAgain}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg font-light tracking-wide transition-all text-sm uppercase"
                  >
                    Try Another Box
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg font-light tracking-wide transition-all text-sm uppercase border border-white/10"
                  >
                    Close & Shop
                  </button>
                </div>
              </div>
            ) : (
              // Game Screen
              <div className="space-y-8">
                {/* Title */}
                <div className="text-center space-y-2">
                  <p className="text-purple-300 text-xs uppercase tracking-widest">Choose Wisely</p>
                  <h3 className="text-2xl font-light text-white">Select Your Mystery Box</h3>
                </div>

                {/* Boxes Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {rewards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleBoxClick(index)}
                      disabled={revealedBoxes.has(index) || isRevealing}
                      className={`relative h-28 rounded-lg transition-all duration-500 transform ${
                        revealedBoxes.has(index)
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-105 cursor-pointer"
                      } ${
                        selectedBox === index && isRevealing
                          ? "scale-110"
                          : ""
                      }`}
                    >
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg blur opacity-0 hover:opacity-100 transition-opacity" />

                      {/* Box Content */}
                      <div
                        className={`relative h-full w-full rounded-lg border-2 flex items-center justify-center font-light transition-all duration-500 ${
                          revealedBoxes.has(index)
                            ? "bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border-purple-500/30"
                            : "bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/50 hover:border-cyan-500/50 group"
                        }`}
                      >
                        {revealedBoxes.has(index) ? (
                          <div className="text-center space-y-1">
                            <p className="text-lg text-gray-400">✓</p>
                            <p className="text-[10px] text-gray-500 uppercase">Opened</p>
                          </div>
                        ) : selectedBox === index && isRevealing ? (
                          <div className="relative w-12 h-12">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-spin" />
                            <div className="absolute inset-1 bg-slate-800 rounded-full" />
                          </div>
                        ) : (
                          <div className="text-center space-y-2">
                            <p className="text-4xl">📦</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                              {index + 1}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Instructions */}
                <p className="text-center text-gray-500 text-xs">
                  Select any box to reveal your mystery discount
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
