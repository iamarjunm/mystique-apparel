"use client";

import { ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";

export default function AdvancedEmailBuilder({ emailData, onUpdate }) {
  const [expandedSection, setExpandedSection] = useState("content");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field, value) => {
    onUpdate({
      ...emailData,
      [field]: value,
    });
  };

  const StyleOptions = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
          Email Style *
        </label>
        <select
          value={emailData.bodyStyle || "professional"}
          onChange={(e) => handleChange("bodyStyle", e.target.value)}
          className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="professional">Professional</option>
          <option value="marketing">Marketing</option>
          <option value="minimal">Minimal</option>
          <option value="dark">Dark</option>
          <option value="elegant">Elegant</option>
        </select>
      </div>
    </div>
  );

  const ContentSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
          Subject Line *
        </label>
        <input
          type="text"
          value={emailData.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          placeholder="What's the email about?"
          maxLength="100"
          className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">{emailData.subject.length}/100</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
          Greeting
        </label>
        <input
          type="text"
          value={emailData.greeting}
          onChange={(e) => handleChange("greeting", e.target.value)}
          placeholder="e.g., Hello there! 👋"
          className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
          Headline *
        </label>
        <input
          type="text"
          value={emailData.headline}
          onChange={(e) => handleChange("headline", e.target.value)}
          placeholder="Main heading of your email"
          maxLength="80"
          className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">{emailData.headline.length}/80</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
          Main Message *
        </label>
        <textarea
          value={emailData.mainMessage}
          onChange={(e) => handleChange("mainMessage", e.target.value)}
          placeholder="Write your main message..."
          maxLength="500"
          className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 h-24 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{emailData.mainMessage.length}/500</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
            Button Text
          </label>
          <input
            type="text"
            value={emailData.ctaText}
            onChange={(e) => handleChange("ctaText", e.target.value)}
            placeholder="e.g., Shop Now"
            maxLength="40"
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">{emailData.ctaText.length}/40</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
            Button Link
          </label>
          <input
            type="text"
            value={emailData.ctaLink}
            onChange={(e) => handleChange("ctaLink", e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
          Footer Text
        </label>
        <input
          type="text"
          value={emailData.footerText}
          onChange={(e) => handleChange("footerText", e.target.value)}
          placeholder="© 2024 Mystique Apparel"
          className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
      </div>
    </div>
  );

  const AdvancedOptions = () => (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-xs text-blue-300">
        <p className="font-semibold mb-2">⚙️ Advanced Options</p>
        <p>These options are for power users who want fine-grained control over email appearance.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
          From Name
        </label>
        <input
          type="text"
          value={emailData.fromName || "Mystique Apparel"}
          onChange={(e) => handleChange("fromName", e.target.value)}
          placeholder="Mystique Apparel"
          className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase">
          Reply-To Email
        </label>
        <input
          type="email"
          value={emailData.replyTo || ""}
          onChange={(e) => handleChange("replyTo", e.target.value)}
          placeholder="support@mystique-apparel.com"
          className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
      </div>

      <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded">
        <input
          type="checkbox"
          checked={emailData.trackOpens || false}
          onChange={(e) => handleChange("trackOpens", e.target.checked)}
          id="trackOpens"
          className="w-4 h-4 rounded checked:bg-purple-500"
        />
        <label htmlFor="trackOpens" className="text-xs font-semibold text-purple-300 flex-1 cursor-pointer">
          Track Email Opens
        </label>
      </div>

      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
        <input
          type="checkbox"
          checked={emailData.trackClicks || false}
          onChange={(e) => handleChange("trackClicks", e.target.checked)}
          id="trackClicks"
          className="w-4 h-4 rounded checked:bg-green-500"
        />
        <label htmlFor="trackClicks" className="text-xs font-semibold text-green-300 flex-1 cursor-pointer">
          Track Link Clicks
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {/* Style Section */}
        <button
          onClick={() => setExpandedSection(expandedSection === "style" ? null : "style")}
          className="w-full flex items-center justify-between p-3 bg-black/40 border border-white/20 rounded hover:bg-black/50 transition-colors group"
        >
          <span className="text-sm font-semibold text-white">🎨 Design Style</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedSection === "style" ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSection === "style" && (
          <div className="bg-black/20 border border-white/10 rounded p-4 space-y-3">
            <StyleOptions />
          </div>
        )}

        {/* Content Section */}
        <button
          onClick={() => setExpandedSection(expandedSection === "content" ? null : "content")}
          className="w-full flex items-center justify-between p-3 bg-black/40 border border-white/20 rounded hover:bg-black/50 transition-colors group"
        >
          <span className="text-sm font-semibold text-white">✍️ Email Content</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedSection === "content" ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSection === "content" && (
          <div className="bg-black/20 border border-white/10 rounded p-4 space-y-4">
            <ContentSection />
          </div>
        )}

        {/* Advanced Section */}
        <button
          onClick={() => setExpandedSection(expandedSection === "advanced" ? null : "advanced")}
          className="w-full flex items-center justify-between p-3 bg-black/40 border border-white/20 rounded hover:bg-black/50 transition-colors group"
        >
          <span className="text-sm font-semibold text-white">⚙️ Advanced Options</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedSection === "advanced" ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSection === "advanced" && (
          <div className="bg-black/20 border border-white/10 rounded p-4 space-y-4">
            <AdvancedOptions />
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-300">
        <p className="font-semibold mb-2">💡 Email Best Practices</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Keep subject lines under 50 characters for better mobile display</li>
          <li>Use clear, action-oriented CTA buttons</li>
          <li>Test emails before sending to large lists</li>
          <li>Include unsubscribe links in footer (required)</li>
          <li>Personalize with recipient names when possible</li>
        </ul>
      </div>
    </div>
  );
}
