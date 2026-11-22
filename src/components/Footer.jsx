"use client";

import { FiInstagram, FiArrowUp } from "react-icons/fi";
import Link from "next/link";
import { ShieldCheck, Truck, Layers, RefreshCw } from "lucide-react";

const footerLinks = {
  archive: [
    { name: "All Pieces", href: "/shop" },
    { name: "New Drops", href: "/shop?newArrival=true" },
    { name: "Best Sellers", href: "/shop?bestseller=true" },
    { name: "Archive Offers", href: "/shop?onSale=true" },
  ],
  atelier: [
    { name: "Our Story", href: "/about" },
    { name: "Wishlist", href: "/wishlist" },
    { name: "Contact Atelier", href: "/contact" },
    {
      name: "Track Shipment",
      href: "https://mystiqueapparel.shiprocket.co/",
      external: true,
    },
  ],
  policies: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-conditions" },
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Refund Policy", href: "/refund-policy" },
  ],
};

const TRUST_STRIP = [
  { icon: Layers, title: "240 GSM Heavyweight", desc: "Combed bio-washed cotton" },
  { icon: Truck, title: "Complimentary Shipping", desc: "Pan-India orders over ₹999" },
  { icon: ShieldCheck, title: "Encrypted Checkout", desc: "Razorpay UPI, Cards & COD" },
  { icon: RefreshCw, title: "Atelier Quality Check", desc: "Inspected before dispatch" },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#0A0A0A] text-[#F4F2ED] overflow-hidden border-t border-white/[0.1]">
      {/* Monochrome Trust Strip */}
      <div className="border-b border-white/[0.1]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_STRIP.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3.5">
                <Icon className="w-4 h-4 text-[#F4F2ED]/70 flex-shrink-0 mt-0.5 stroke-[1.5px]" />
                <div>
                  <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#F4F2ED]">
                    {item.title}
                  </p>
                  <p className="font-body text-xs text-[#8E8B84] mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block">
              <img
                src="https://cdn.shopify.com/s/files/1/0591/7045/5631/files/mystique_white.webp?v=1717770206"
                alt="Mystique Apparel"
                className="h-10 object-contain"
              />
            </Link>
            <p className="font-body text-[#8E8B84] text-xs sm:text-sm leading-relaxed max-w-xs font-light">
              Architectural heavyweight streetwear engineered in small batches in India. Restrained silhouettes, uncompromising textile density.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/mystique_.apparel/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/20 flex items-center justify-center text-[#F4F2ED] hover:bg-[#F4F2ED] hover:text-[#0A0A0A] transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="text-sm" />
              </a>
              <a
                href="mailto:apparelmystique1@gmail.com"
                className="px-3.5 py-2 border border-white/15 font-mono-tech text-[10px] tracking-[0.14em] text-[#F4F2ED]/80 hover:border-[#F4F2ED] hover:text-[#F4F2ED] transition-colors"
              >
                apparelmystique1@gmail.com
              </a>
            </div>
          </div>

          {/* Archive */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-[#8E8B84]">
              Archive
            </h4>
            <ul className="space-y-3">
              {footerLinks.archive.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-body text-xs sm:text-sm text-[#F4F2ED]/75 hover:text-[#F4F2ED] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atelier */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-[#8E8B84]">
              Atelier &amp; Care
            </h4>
            <ul className="space-y-3">
              {footerLinks.atelier.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs sm:text-sm text-[#F4F2ED]/75 hover:text-[#F4F2ED] transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="font-body text-xs sm:text-sm text-[#F4F2ED]/75 hover:text-[#F4F2ED] transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-[#8E8B84]">
              Policies
            </h4>
            <ul className="space-y-3">
              {footerLinks.policies.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-body text-xs sm:text-sm text-[#F4F2ED]/75 hover:text-[#F4F2ED] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Scroll to Top */}
        <div className="pt-8 border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono-tech text-[#8E8B84] text-[10px] tracking-[0.2em] uppercase">
            © {new Date().getFullYear()} Mystique Apparel — Born In India
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#F4F2ED]/75 hover:text-[#0A0A0A] hover:bg-[#F4F2ED] px-4 py-2 border border-white/20 transition-colors"
          >
            <span>Top</span>
            <FiArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Monumental Architectural Wordmark */}
      <div
        className="w-full overflow-hidden select-none pointer-events-none pt-2 pb-4 text-center"
        aria-hidden="true"
      >
        <p className="font-display italic font-bold uppercase text-[15vw] leading-[0.8] tracking-[-0.04em] text-[#F4F2ED]/[0.05]">
          MYSTIQUE
        </p>
      </div>
    </footer>
  );
}
