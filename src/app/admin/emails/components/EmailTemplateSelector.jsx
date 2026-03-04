"use client";

import { ChevronRight } from "lucide-react";
import EMAIL_TEMPLATES from "./EmailTemplateLibrary";

export default function EmailTemplateSelector({ onSelectTemplate }) {
  const categories = {
    promotional: { name: "🎯 Promotional", color: "purple" },
    engagement: { name: "💝 Engagement", color: "pink" },
    content: { name: "📚 Content", color: "blue" },
    seasonal: { name: "🌍 Seasonal", color: "green" },
    service: { name: "📋 Service", color: "amber" },
    reengagement: { name: "🔄 Re-engagement", color: "orange" },
  };

  const groupedTemplates = Object.entries(EMAIL_TEMPLATES).reduce((acc, [key, template]) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push({ key, ...template });
    return acc;
  }, {});

  const colorClasses = {
    purple: "hover:bg-purple-500/20 border-purple-500/30",
    pink: "hover:bg-pink-500/20 border-pink-500/30",
    blue: "hover:bg-blue-500/20 border-blue-500/30",
    green: "hover:bg-green-500/20 border-green-500/30",
    amber: "hover:bg-amber-500/20 border-amber-500/30",
    orange: "hover:bg-orange-500/20 border-orange-500/30",
  };

  const categoryColors = {
    purple: "text-purple-400",
    pink: "text-pink-400",
    blue: "text-blue-400",
    green: "text-green-400",
    amber: "text-amber-400",
    orange: "text-orange-400",
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Tip:</strong> Select a template to get started, then customize it to match your campaign goals.
        </p>
      </div>

      {Object.entries(groupedTemplates).map(([categoryKey, templates]) => {
        const category = categories[categoryKey];
        const colorClass = colorClasses[category.color];
        const textColor = categoryColors[category.color];

        return (
          <div key={categoryKey} className="space-y-3">
            <h3 className={`text-sm font-bold ${textColor} uppercase tracking-wider`}>
              {category.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.key}
                  onClick={() => onSelectTemplate(template)}
                  className={`text-left p-4 border border-white/10 rounded transition-all ${colorClass} group`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white group-hover:text-white transition-colors truncate">
                        {template.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {template.subject}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
