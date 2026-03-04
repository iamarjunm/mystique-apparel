"use client";

import { Copy, Download } from "lucide-react";

const BODY_STYLES = {
  professional: {
    bgColor: "#ffffff",
    headerBg: "#1a1a1a",
    accentColor: "#007bff",
    textColor: "#333333",
    borderColor: "#e0e0e0",
  },
  marketing: {
    bgColor: "#ffffff",
    headerBg: "linear-gradient(135deg, #0096ff 0%, #0066cc 100%)",
    accentColor: "#ff6b35",
    textColor: "#333333",
    borderColor: "#e0e0e0",
  },
  minimal: {
    bgColor: "#f5f5f5",
    headerBg: "#ffffff",
    accentColor: "#555555",
    textColor: "#666666",
    borderColor: "#ddd",
  },
  dark: {
    bgColor: "#1a1a1a",
    headerBg: "#000000",
    accentColor: "#00d4ff",
    textColor: "#f0f0f0",
    borderColor: "#333",
  },
  elegant: {
    bgColor: "#fafaf9",
    headerBg: "#2d2520",
    accentColor: "#d4a373",
    textColor: "#2d2520",
    borderColor: "#e7e5e4",
  },
};

export default function EmailPreviewRenderer({ emailData, style = "professional" }) {
  // Use premium design from template if available, otherwise use legacy styles
  const designConfig = emailData.design || BODY_STYLES[style] || BODY_STYLES.professional;

  const generateEmailHTML = () => {
    const headerStyle = designConfig.headerBg || designConfig.header_bg;
    const accentColor = designConfig.accentColor || designConfig.accent_color;
    const bgColor = designConfig.backgroundColor || designConfig.background_color;
    const textColor = designConfig.textColor || designConfig.text_color;
    const borderColor = designConfig.borderColor || designConfig.border_color;
    const buttonBg = designConfig.buttonBg || accentColor;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${bgColor}; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid ${borderColor}; }
    .header { background: ${headerStyle}; color: white; padding: 50px 30px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 700; letter-spacing: 0.5px; }
    .header-subtitle { font-size: 14px; opacity: 0.95; font-weight: 400; }
    .content { padding: 40px 30px; color: ${textColor}; line-height: 1.8; }
    .content p { margin-bottom: 15px; font-size: 15px; }
    .greeting { font-size: 16px; font-weight: 500; margin-bottom: 20px; }
    .headline { font-size: 28px; font-weight: 700; color: ${accentColor}; margin: 30px 0 20px 0; line-height: 1.3; }
    .subheading { font-size: 18px; font-weight: 600; color: ${accentColor}; margin: 25px 0 15px 0; }
    .message-box { background: rgba(0,0,0,0.03); padding: 20px; border-left: 4px solid ${accentColor}; margin: 20px 0; border-radius: 6px; }
    .cta-button { display: inline-block; background: ${buttonBg}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 30px 0; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .cta-button:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
    .secondary-cta { display: inline-block; background: transparent; color: ${accentColor}; padding: 12px 24px; text-decoration: underline; font-weight: 500; margin: 15px 10px 15px 0; font-size: 14px; }
    .footer { background: linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.03) 100%); color: ${textColor}; padding: 30px; text-align: center; font-size: 12px; border-top: 1px solid ${borderColor}; }
    .footer-links { margin: 15px 0; }
    .footer-links a { color: ${accentColor}; text-decoration: none; margin: 0 15px; font-size: 12px; font-weight: 500; }
    .divider { border-top: 1px solid ${borderColor}; margin: 30px 0; }
    .feature-list { list-style: none; padding: 0; }
    .feature-list li { padding: 10px 0; border-bottom: 1px solid ${borderColor}; }
    .feature-list li:last-child { border-bottom: none; }
    .feature-list strong { color: ${accentColor}; }
    .testimonial { border-left: 4px solid ${accentColor}; padding: 15px 20px; background: rgba(0,0,0,0.03); margin: 20px 0; font-style: italic; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ Mystique Apparel</h1>
      <div class="header-subtitle">Premium Fashion & Timeless Style</div>
    </div>
    <div class="content">
      <p class="greeting">${emailData.greeting || "Hello there! 👋"}</p>
      <h2 class="headline">${emailData.headline || "Welcome to Mystique"}</h2>
      <p>${emailData.mainMessage || "We're excited to share something special with you."}</p>
      <a href="${emailData.ctaLink || "#"}" class="cta-button">${emailData.ctaText || "Explore Now"}</a>
      <p style="margin-top: 30px; font-size: 14px; color: #666;">Best regards,<br><strong>The Mystique Apparel Team</strong></p>
    </div>
    <div class="footer">
      <p>${emailData.footerText || "© 2024 Mystique Apparel. All Rights Reserved."}</p>
      <div class="footer-links">
        <a href="#">About Us</a>
        <a href="#">Contact</a>
        <a href="#">Privacy Policy</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">EMAIL PREVIEW</p>
          <p className="text-sm text-gray-300">
            Subject: <strong>{emailData.subject || "(No subject)"}</strong>
          </p>
        </div>
      </div>

      <div className="bg-white rounded overflow-hidden border border-gray-300 shadow-lg">
        <iframe
          srcDoc={generateEmailHTML()}
          className="w-full h-96 border-none"
          title="Email Preview"
        />
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-xs text-blue-300">
        <p className="font-semibold mb-2">📧 Preview Information</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>This is how your email will look in most inbox clients</li>
          <li>The actual rendered version may vary slightly</li>
          <li>Test on mobile devices before sending</li>
        </ul>
      </div>
    </div>
  );
}
