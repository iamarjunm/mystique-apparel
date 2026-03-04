"use client";

// Quick reference for all available email templates
// Copy template data format for creating new templates

export const TEMPLATE_QUICK_REFERENCE = {
  promotional: {
    title: "🎯 Promotional Templates",
    description: "Sales, launches, and special promotions",
    templates: [
      {
        id: "newCollection",
        name: "New Collection Launch",
        useCase: "Announce new product arrivals",
        bestFor: "Product launches, seasonal releases",
      },
      {
        id: "seasonalSale",
        name: "Seasonal Sale",
        useCase: "Promote seasonal discounts",
        bestFor: "20-70% off campaigns, clearance sales",
      },
      {
        id: "flashSale",
        name: "Flash Sale",
        useCase: "Ultra-limited time offers",
        bestFor: "24-hour deals, stock clearance",
      },
    ],
  },
  engagement: {
    title: "💝 Engagement Templates",
    description: "Customer retention and relationships",
    templates: [
      {
        id: "exclusiveOffer",
        name: "Exclusive Offer",
        useCase: "VIP customer deals",
        bestFor: "Loyal customers, VIP members",
      },
      {
        id: "birthdaySpecial",
        name: "Birthday Special",
        useCase: "Personalized birthday offers",
        bestFor: "Birthday campaigns, customer appreciation",
      },
      {
        id: "cartReminder",
        name: "Cart Reminder",
        useCase: "Recover abandoned shopping carts",
        bestFor: "Cart abandonment recovery, urgency",
      },
    ],
  },
  content: {
    title: "📚 Content Templates",
    description: "Educational and informational emails",
    templates: [
      {
        id: "newBlogPost",
        name: "New Blog Post",
        useCase: "Share style guides and tips",
        bestFor: "Content marketing, thought leadership",
      },
      {
        id: "styleGuide",
        name: "Style Guide",
        useCase: "Fashion advice and trend reports",
        bestFor: "Fashion tips, styling advice, trends",
      },
    ],
  },
  seasonal: {
    title: "🌍 Seasonal Templates",
    description: "Holiday and season-specific campaigns",
    templates: [
      {
        id: "holidaySeason",
        name: "Holiday Campaign",
        useCase: "Seasonal gift guides and promotions",
        bestFor: "Christmas, Thanksgiving, holidays",
      },
      {
        id: "summmerVibe",
        name: "Summer Collection",
        useCase: "Seasonal product pushes",
        bestFor: "Summer sales, seasonal launches",
      },
    ],
  },
  service: {
    title: "📋 Service Templates",
    description: "Customer service and support communications",
    templates: [
      {
        id: "orderConfirmation",
        name: "Order Confirmation",
        useCase: "Post-purchase follow-up",
        bestFor: "Order acknowledgment, transaction confirmation",
      },
      {
        id: "shippingUpdate",
        name: "Shipping Update",
        useCase: "Delivery notifications",
        bestFor: "Shipment tracking, delivery updates",
      },
      {
        id: "feedbackRequest",
        name: "Feedback Request",
        useCase: "Review collection and feedback",
        bestFor: "Post-purchase surveys, customer feedback",
      },
    ],
  },
  reengagement: {
    title: "🔄 Re-engagement Templates",
    description: "Win-back and reactivation campaigns",
    templates: [
      {
        id: "winbackCampaign",
        name: "Win-Back Campaign",
        useCase: "Bring back inactive customers",
        bestFor: "Customer reactivation, win-back offers",
      },
      {
        id: "reactivationOffer",
        name: "Reactivation Offer",
        useCase: "Special comeback deals",
        bestFor: "Lapsed customer engagement, special offers",
      },
    ],
  },
};

// Template creation format (for developers adding new templates)
export const TEMPLATE_FORMAT = {
  name: "Template Name",
  category: "promotional|engagement|content|seasonal|service|reengagement",
  subject: "Email subject line (max 100 chars)",
  greeting: "Opening greeting with emoji",
  headline: "Main heading (max 80 chars)",
  mainMessage: "Body text content (max 500 chars)",
  ctaText: "Button text (max 40 chars)",
  ctaLink: "https://mystique-apparel.com/path",
  footerText: "© 2024 Mystique Apparel",
  bodyStyle: "professional|marketing|minimal|dark|elegant",
};

// Design style preview reference
export const STYLE_REFERENCE = {
  professional: {
    headerBg: "Dark gray (#1a1a1a)",
    accentColor: "Blue (#007bff)",
    bestFor: "Order updates, announcements, service emails",
    tone: "Professional, trustworthy, official",
  },
  marketing: {
    headerBg: "Blue gradient",
    accentColor: "Orange (#ff6b35)",
    bestFor: "Sales, promotions, launches",
    tone: "Energetic, exciting, promotional",
  },
  minimal: {
    headerBg: "White",
    accentColor: "Gray (#555555)",
    bestFor: "Blog posts, content, educational",
    tone: "Clean, simple, focused",
  },
  dark: {
    headerBg: "Black",
    accentColor: "Cyan (#00d4ff)",
    bestFor: "Luxury, premium, exclusive offers",
    tone: "Modern, premium, sophisticated",
  },
  elegant: {
    headerBg: "Dark brown (#2d2520)",
    accentColor: "Gold (#d4a373)",
    bestFor: "High-end products, VIP communications",
    tone: "Refined, sophisticated, exclusive",
  },
};

export default function EmailTemplateReference() {
  return (
    <div className="space-y-8 p-6 bg-black/30 border border-white/10 rounded">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          📧 Email Template Reference
        </h2>
        <p className="text-gray-400">
          Quick guide for all available templates and styles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(TEMPLATE_QUICK_REFERENCE).map(([key, category]) => (
          <div key={key} className="border border-white/10 rounded p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              {category.title}
            </h3>
            <p className="text-sm text-gray-400 mb-4">{category.description}</p>
            <ul className="space-y-2">
              {category.templates.map((template) => (
                <li key={template.id} className="text-sm">
                  <p className="font-semibold text-blue-400">
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-500">{template.useCase}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Best for: {template.bestFor}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          🎨 Design Styles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(STYLE_REFERENCE).map(([key, style]) => (
            <div
              key={key}
              className="bg-white/5 border border-white/10 rounded p-3"
            >
              <h4 className="font-semibold text-white capitalize mb-2">
                {key}
              </h4>
              <p className="text-xs text-gray-400 mb-2">
                <strong>Header:</strong> {style.headerBg}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                <strong>Accent:</strong> {style.accentColor}
              </p>
              <p className="text-xs text-gray-300 mb-2">
                <strong>Best for:</strong> {style.bestFor}
              </p>
              <p className="text-xs text-gray-500">
                <em>Tone: {style.tone}</em>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
        <h3 className="font-semibold text-blue-300 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• Start with a template that matches your campaign goal</li>
          <li>• Customize content to match your brand voice</li>
          <li>• Always preview before sending</li>
          <li>• Test with yourself first</li>
          <li>• Track opens and clicks for future campaigns</li>
        </ul>
      </div>
    </div>
  );
}
