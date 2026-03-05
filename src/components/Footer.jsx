import { FiInstagram } from 'react-icons/fi';
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-black via-gray-950 to-black text-white border-t border-white/10 py-12 sm:py-14 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold tracking-wide">Mystique Apparel</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Premium sustainable fashion for the modern lifestyle.
            </p>
            {/* Social Media */}
            <div className="flex gap-4 pt-2">
              <a 
                href="https://www.instagram.com/mystique_.apparel/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg sm:text-xl hover:text-gray-300 transition-colors duration-300"
                aria-label="Instagram"
              >
                <FiInstagram />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-white transition-colors duration-300">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=men" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link href="/shop?category=women" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link href="/shop?onSale=true" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Sale Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8"></div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-xs sm:text-sm space-y-2">
          <p>© {new Date().getFullYear()} Mystique Apparel. All Rights Reserved.</p>
          <p className="text-gray-500">Crafted with precision. Designed for you.</p>
          <p className="mt-4 text-gray-400">Contact: <a href="mailto:apparelmystique1@gmail.com" className="text-white hover:text-gray-300 transition-colors">apparelmystique1@gmail.com</a></p>
        </div>
      </div>
    </footer>
  );
}
