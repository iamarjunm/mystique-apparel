"use client";

// Premium Email Template Library with Distinct Design Styles
// Each template has a unique color scheme and visual identity

const EMAIL_TEMPLATES = {
  // ===== PROMOTIONAL TEMPLATES =====
  newCollection: {
    name: "New Collection Launch",
    category: "promotional",
    subject: "🎨 Introducing Our Latest Collection",
    greeting: "Hey there, fashion lover! 👋",
    headline: "Experience the New Mystique Collection",
    mainMessage:
      "We're thrilled to unveil our latest designs. Featuring bold cuts, premium fabrics, and exclusive styles that redefine modern fashion. Each piece is carefully crafted to make a statement.",
    ctaText: "Explore Now",
    ctaLink: "https://mystique-apparel.com/new-arrivals",
    footerText: "© 2024 Mystique Apparel | All Rights Reserved",
    bodyStyle: "vibrant",
    design: {
      headerBg: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
      accentColor: "#EC4899",
      backgroundColor: "#0F172A",
      textColor: "#F1F5F9",
      borderColor: "#8B5CF6",
      buttonBg: "linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)",
    },
  },

  seasonalSale: {
    name: "Seasonal Sale",
    category: "promotional",
    subject: "🎉 Mega Sale Alert - Up to 70% Off!",
    greeting: "Hello Style Enthusiast! 👗",
    headline: "Seasonal Sale - Limited Time Offer",
    mainMessage:
      "Our biggest sale of the season is here! Discover incredible discounts on your favorite pieces. From sleek minimalist designs to bold statement pieces, find everything you love at unbeatable prices. Hurry, stock is limited!",
    ctaText: "Shop Sale",
    ctaLink: "https://mystique-apparel.com/sale",
    footerText: "© 2024 Mystique Apparel | Sale ends soon!",
    bodyStyle: "warm",
    design: {
      headerBg: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
      accentColor: "#F59E0B",
      backgroundColor: "#1F1F1F",
      textColor: "#FFFFFF",
      borderColor: "#F59E0B",
      buttonBg: "linear-gradient(135deg, #F59E0B 0%, #F59E0B 100%)",
    },
  },

  flashSale: {
    name: "Flash Sale",
    category: "promotional",
    subject: "⚡ Flash Sale: 24 Hours Only!",
    greeting: "Quick! 🏃‍♀️",
    headline: "Flash Sale - 24 Hours Only",
    mainMessage:
      "You've got 24 hours to grab incredible deals on selected items. From our best-selling pieces to new arrivals, everything must go. Don't miss this limited-time opportunity!",
    ctaText: "Shop Flash Sale",
    ctaLink: "https://mystique-apparel.com/flash-sale",
    footerText: "© 2024 Mystique Apparel | Offer expires in 24 hours",
    bodyStyle: "energetic",
    design: {
      headerBg: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
      accentColor: "#EF4444",
      backgroundColor: "#0A0A0A",
      textColor: "#FFFFFF",
      borderColor: "#EF4444",
      buttonBg: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    },
  },

  exclusiveOffer: {
    name: "Exclusive Offer",
    category: "engagement",
    subject: "✨ Exclusive Offer Just for You",
    greeting: "Hello Valued Customer! 💎",
    headline: "You've Been Specially Selected",
    mainMessage:
      "As one of our most loyal customers, we'd love to offer you something special. Enjoy 25% off your next purchase with code EXCLUSIVE25. This offer is exclusively for you!",
    ctaText: "Claim Your Discount",
    ctaLink: "https://mystique-apparel.com/exclusive",
    footerText: "© 2024 Mystique Apparel | Thank you for your loyalty",
    bodyStyle: "luxury",
    design: {
      headerBg: "linear-gradient(135deg, #D4A373 0%, #A67C52 100%)",
      accentColor: "#D4A373",
      backgroundColor: "#1A1410",
      textColor: "#F5E6D3",
      borderColor: "#D4A373",
      buttonBg: "linear-gradient(135deg, #D4A373 0%, #C9964F 100%)",
    },
  },

  birthdaySpecial: {
    name: "Birthday Special",
    category: "engagement",
    subject: "🎂 Happy Birthday! Here's Your Gift",
    greeting: "Happy Birthday! 🎉",
    headline: "Birthday Surprise Just for You",
    mainMessage:
      "We're celebrating YOU today! As a token of our appreciation, enjoy 30% off your entire purchase this week. It's our way of saying thank you for being part of the Mystique family.",
    ctaText: "Redeem Birthday Gift",
    ctaLink: "https://mystique-apparel.com/birthday",
    footerText: "© 2024 Mystique Apparel | Enjoy your special day!",
    bodyStyle: "festive",
    design: {
      headerBg: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
      accentColor: "#06B6D4",
      backgroundColor: "#082F49",
      textColor: "#CFFAFE",
      borderColor: "#06B6D4",
      buttonBg: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
    },
  },

  cartReminder: {
    name: "Cart Reminder",
    category: "engagement",
    subject: "👜 Don't Forget Your Items!",
    greeting: "Hey! 👋",
    headline: "You Left Something Behind",
    mainMessage:
      "We noticed you left some amazing items in your cart. Don't miss out on these pieces! Complete your purchase today and enjoy free shipping on orders over $100.",
    ctaText: "Complete Purchase",
    ctaLink: "https://mystique-apparel.com/cart",
    footerText: "© 2024 Mystique Apparel | Your cart expires in 48 hours",
    bodyStyle: "minimal",
    design: {
      headerBg: "linear-gradient(135deg, #64748B 0%, #475569 100%)",
      accentColor: "#64748B",
      backgroundColor: "#F1F5F9",
      textColor: "#1E293B",
      borderColor: "#94A3B8",
      buttonBg: "linear-gradient(135deg, #64748B 0%, #475569 100%)",
    },
  },

  newBlogPost: {
    name: "New Blog Post",
    category: "content",
    subject: "📖 New Style Guide: How to Layer for Every Season",
    greeting: "Hello Fashion Enthusiast! 👗",
    headline: "Check Out Our Latest Blog Post",
    mainMessage:
      "We just published a detailed style guide on layering techniques that work for every season. Discover expert tips on mixing textures, colors, and pieces to create the perfect look.",
    ctaText: "Read Blog Post",
    ctaLink: "https://mystique-apparel.com/blog",
    footerText: "© 2024 Mystique Apparel | Stay Inspired",
    bodyStyle: "editorial",
    design: {
      headerBg: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
      accentColor: "#3B82F6",
      backgroundColor: "#F8FAFC",
      textColor: "#1E293B",
      borderColor: "#E2E8F0",
      buttonBg: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    },
  },

  styleGuide: {
    name: "Style Guide",
    category: "content",
    subject: "✨ Your Complete Style Guide to This Season",
    greeting: "Hello Style Seekers! 🌟",
    headline: "Your Complete Guide to This Season's Trends",
    mainMessage:
      "From bold colors to timeless neutrals, we've curated a comprehensive guide to help you navigate this season's hottest trends. Learn how to mix and match pieces to express your unique style.",
    ctaText: "Explore Guide",
    ctaLink: "https://mystique-apparel.com/style-guide",
    footerText: "© 2024 Mystique Apparel | Fashion Tips & Trends",
    bodyStyle: "sophisticated",
    design: {
      headerBg: "linear-gradient(135deg, #4C1D95 0%, #581C87 100%)",
      accentColor: "#A78BFA",
      backgroundColor: "#2D1B4E",
      textColor: "#E9D5FF",
      borderColor: "#A78BFA",
      buttonBg: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
    },
  },

  holidaySeason: {
    name: "Holiday Campaign",
    category: "seasonal",
    subject: "🎄 Holiday Gift Guide - Perfect Presents Await",
    greeting: "Happy Holidays! 🎅",
    headline: "Your Ultimate Holiday Gift Guide",
    mainMessage:
      "The holidays are here! Whether you're shopping for yourself or looking for the perfect gift, our curated collection has something for everyone. Find timeless pieces and trendy outfits that make perfect gifts.",
    ctaText: "Shop Holiday Collection",
    ctaLink: "https://mystique-apparel.com/holiday",
    footerText: "© 2024 Mystique Apparel | Spread the Style",
    bodyStyle: "festive",
    design: {
      headerBg: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      accentColor: "#34D399",
      backgroundColor: "#031F1B",
      textColor: "#D1FAE5",
      borderColor: "#34D399",
      buttonBg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    },
  },

  summerVibe: {
    name: "Summer Collection",
    category: "seasonal",
    subject: "☀️ Summer Vibes - Fresh Styles for the Season",
    greeting: "Ready for Summer? 🌞",
    headline: "Summer Collection - Light, Breezy & Bold",
    mainMessage:
      "Embrace the summer season with our latest lightweight and colorful collection. From sundresses to linen shirts, we've got everything you need to stay stylish and comfortable all summer long.",
    ctaText: "Shop Summer",
    ctaLink: "https://mystique-apparel.com/summer",
    footerText: "© 2024 Mystique Apparel | Beat the Heat in Style",
    bodyStyle: "vibrant",
    design: {
      headerBg: "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)",
      accentColor: "#22D3EE",
      backgroundColor: "#082F49",
      textColor: "#CFFAFE",
      borderColor: "#06B6D4",
      buttonBg: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
    },
  },

  orderConfirmation: {
    name: "Order Confirmation",
    category: "service",
    subject: "✅ Order Confirmed - Your Shopping Adventure Begins",
    greeting: "Thank You for Your Purchase! 🎉",
    headline: "Your Order Has Been Confirmed",
    mainMessage:
      "Your order has been successfully placed and is now being prepared for shipment. You can track your package at any time using your order number. We're excited to get your new pieces to you soon!",
    ctaText: "Track Order",
    ctaLink: "https://mystique-apparel.com/orders",
    footerText: "© 2024 Mystique Apparel | Thank You!",
    bodyStyle: "professional",
    design: {
      headerBg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
      accentColor: "#22C55E",
      backgroundColor: "#FAFAFA",
      textColor: "#1F2937",
      borderColor: "#E5E7EB",
      buttonBg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
    },
  },

  shippingUpdate: {
    name: "Shipping Update",
    category: "service",
    subject: "📦 Your Order is On Its Way!",
    greeting: "Great News! 📫",
    headline: "Your Order Has Shipped",
    mainMessage:
      "Your order has been shipped and is on its way to you! Track your package in real-time to know exactly when your new fashion pieces will arrive. We hope you love them!",
    ctaText: "Track Shipment",
    ctaLink: "https://mystique-apparel.com/orders",
    footerText: "© 2024 Mystique Apparel | Coming Soon!",
    bodyStyle: "clean",
    design: {
      headerBg: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
      accentColor: "#0EA5E9",
      backgroundColor: "#FFFFFF",
      textColor: "#0F172A",
      borderColor: "#E0E7FF",
      buttonBg: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
    },
  },

  feedbackRequest: {
    name: "Feedback Request",
    category: "service",
    subject: "⭐ We'd Love to Hear From You!",
    greeting: "Hello Valued Customer! 💬",
    headline: "Share Your Experience With Us",
    mainMessage:
      "We'd love to know what you think about your recent purchase! Your feedback helps us improve and create even better styles for you. Share your thoughts and get 10% off your next order.",
    ctaText: "Leave Review",
    ctaLink: "https://mystique-apparel.com/reviews",
    footerText: "© 2024 Mystique Apparel | Your Opinion Matters",
    bodyStyle: "warm",
    design: {
      headerBg: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
      accentColor: "#F97316",
      backgroundColor: "#1F1410",
      textColor: "#FEDD95",
      borderColor: "#F97316",
      buttonBg: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    },
  },

  winbackCampaign: {
    name: "Win-Back Campaign",
    category: "reengagement",
    subject: "👋 We Miss You! Come Back for 20% Off",
    greeting: "We Miss You! 😢",
    headline: "We'd Love to See You Again",
    mainMessage:
      "It's been a while since your last visit, and we've missed you! To welcome you back, we're offering 20% off your next purchase. Check out our latest collection and rediscover your style.",
    ctaText: "Welcome Back",
    ctaLink: "https://mystique-apparel.com/welcome-back",
    footerText: "© 2024 Mystique Apparel | Come Back Home",
    bodyStyle: "elegant",
    design: {
      headerBg: "linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)",
      accentColor: "#A78BFA",
      backgroundColor: "#2E1A47",
      textColor: "#E9D5FF",
      borderColor: "#A78BFA",
      buttonBg: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
    },
  },

  reactivationOffer: {
    name: "Reactivation Offer",
    category: "reengagement",
    subject: "🌟 Your Special Comeback Offer is Ready",
    greeting: "It's Time to Shine Again! ✨",
    headline: "Special Offer for Our Returning Customers",
    mainMessage:
      "We've created an exclusive offer just for you! As a returning customer, you get 25% off plus free shipping on your next order. Your style evolution continues with us.",
    ctaText: "Claim Offer",
    ctaLink: "https://mystique-apparel.com/comeback",
    footerText: "© 2024 Mystique Apparel | Welcome Back",
    bodyStyle: "premium",
    design: {
      headerBg: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
      accentColor: "#EC4899",
      backgroundColor: "#1A0F1F",
      textColor: "#F5E6F0",
      borderColor: "#EC4899",
      buttonBg: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
    },
  },
};

export default EMAIL_TEMPLATES;
