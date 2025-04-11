import { FiInstagram, FiTwitter, FiFacebook } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-wide text-gradient-to-r from-white to-gray-400">
          Mystique Apparel
        </div>

        {/* Social Media */}
        <div className="flex gap-8 mt-6 md:mt-0">
          <FiInstagram className="text-2xl hover:text-gray-400 transition-all transform hover:scale-110 cursor-pointer" />
          <FiTwitter className="text-2xl hover:text-gray-400 transition-all transform hover:scale-110 cursor-pointer" />
          <FiFacebook className="text-2xl hover:text-gray-400 transition-all transform hover:scale-110 cursor-pointer" />
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-400 text-sm mt-12">
        © {new Date().getFullYear()} Mystique Apparel. All Rights Reserved.
      </div>
    </footer>
  );
}
