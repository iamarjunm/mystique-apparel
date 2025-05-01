"use client";

import { useState } from "react";
import { FiShoppingCart, FiHeart, FiMenu, FiX, FiUser, FiChevronDown } from "react-icons/fi";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const { user, logout } = useUser();
  const router = useRouter();

  // Shop categories
  const shopCategories = [
    {
      name: "All Products",
      href: "/shop",
    },
    {
      name: "Collections",
      subcategories: [
        { name: "Summer Collection", href: "/collections/summer-collection" },
        { name: "Winter Collection", href: "/collections/winter-collection" },
      ],
    },
    {
      name: "Categories",
      subcategories: [
        { name: "Oversized T-Shirts", href: "/categories/oversized-t-shirts" },
        { name: "Joggers", href: "/categories/joggers" },
        { name: "Hoodies", href: "/categories/hoodies" },
      ],
    },
  ];

  // Profile dropdown items
  const loggedInProfileItems = [
    { name: "My Account", href: "/account" },
    { name: "Track Orders", href: "https://mystiqueapparel.shiprocket.co/" },
    { name: "Logout", onClick: () => handleLogout() },
  ];

  const loggedOutProfileItems = [
    { name: "Login", href: "/account/login" },
    { name: "Register", href: "/account/register" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-lg text-white z-50 shadow-[0px_10px_30px_rgba(255,255,255,0.05)]">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo - Visible on both mobile and desktop */}
        <Link href="/" className="flex items-center">
          <img
            src="https://cdn.shopify.com/s/files/1/0591/7045/5631/files/mystique_white.webp?v=1717770206"
            alt="Mystique Logo"
            className="h-10 md:h-12 object-contain"
          />
        </Link>
  
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-10 text-lg font-medium tracking-wide items-center">
          {/* Shop Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setIsShopDropdownOpen(true)}
            onMouseLeave={() => setIsShopDropdownOpen(false)}
          >
            <button className="flex items-center gap-2 hover:text-gray-300 transition-all">
              <span>Shop</span>
              <FiChevronDown className="text-xl" />
            </button>
            {isShopDropdownOpen && (
              <div className="absolute top-full left-0 bg-black/90 backdrop-blur-lg rounded-lg shadow-xl py-6 w-max min-w-[200px]">
                <div className="flex gap-12">
                  {shopCategories.map((category) => (
                    <div key={category.name} className="space-y-4">
                      <Link
                        href={category.href || "#"}
                        className="block px-6 py-2 text-white hover:bg-white/10 transition-all font-semibold text-lg"
                      >
                        {category.name}
                      </Link>
                      {category.subcategories && (
                        <div className="pl-6 space-y-2">
                          {category.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.name}
                              href={subcategory.href}
                              className="block px-6 py-1 text-white hover:bg-white/10 transition-all text-sm"
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Other Links */}
          {["About", "Contact"].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`} className="relative group">
              <span className="hover:text-gray-300">{item}</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-6">
          {/* Wishlist */}
          <Link href="/wishlist" className="relative group">
            <FiHeart className="text-2xl transition-all duration-300 group-hover:text-gray-300 cursor-pointer" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative group">
            <FiShoppingCart className="text-2xl transition-all duration-300 group-hover:text-gray-300 cursor-pointer" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div
            className="relative group hidden md:block"
            onMouseEnter={() => setIsProfileDropdownOpen(true)}
            onMouseLeave={() => setIsProfileDropdownOpen(false)}
          >
            <button className="flex items-center gap-2 hover:text-gray-300">
              <FiUser className="text-2xl" />
              <FiChevronDown className="text-xl" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg py-2 w-48">
                {user
                  ? loggedInProfileItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href || "#"}
                        onClick={item.onClick}
                        className="block px-4 py-2 text-white hover:bg-white/10 transition-all"
                      >
                        {item.name}
                      </Link>
                    ))
                  : loggedOutProfileItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-white hover:bg-white/10 transition-all"
                      >
                        {item.name}
                      </Link>
                    ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-3xl transition-all duration-300 hover:text-gray-300" onClick={() => setIsOpen(!isOpen)}>
            <FiMenu />
          </button>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-black/90 backdrop-blur-lg flex flex-col transition-all duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header with Close Button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img
              src="https://cdn.shopify.com/s/files/1/0591/7045/5631/files/mystique_white.webp?v=1717770206"
              alt="Mystique Logo"
              className="h-10 object-contain"
            />
          </Link>
          <button 
            className="text-3xl transition-all duration-300 hover:text-gray-300"
            onClick={() => setIsOpen(false)}
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Shop Dropdown */}
          <div className="space-y-4">
            <button
              className="flex items-center justify-between w-full text-xl py-2"
              onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
            >
              <span>Shop</span>
              <FiChevronDown className={`transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isShopDropdownOpen && (
              <div className="pl-4 space-y-4">
                {shopCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <Link
                      href={category.href || "#"}
                      className="block py-2 hover:text-gray-300"
                      onClick={() => setIsOpen(false)}
                    >
                      {category.name}
                    </Link>
                    {category.subcategories && (
                      <div className="pl-4 space-y-2">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.name}
                            href={subcategory.href}
                            className="block py-1.5 text-gray-300 hover:text-white"
                            onClick={() => setIsOpen(false)}
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other Links */}
          {["About", "Contact"].map((item) => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase()}`} 
              className="block text-xl py-2 hover:text-gray-300" 
              onClick={() => setIsOpen(false)}
            >
              {item}
            </Link>
          ))}

          {/* Profile Dropdown */}
          <div className="space-y-4">
            <button
              className="flex items-center justify-between w-full text-xl py-2"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              <span>Account</span>
              <FiChevronDown className={`transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isProfileDropdownOpen && (
              <div className="pl-4 space-y-2">
                {user
                  ? loggedInProfileItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href || "#"}
                        onClick={() => {
                          item.onClick?.();
                          setIsOpen(false);
                        }}
                        className="block py-1.5 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    ))
                  : loggedOutProfileItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block py-1.5 text-gray-300 hover:text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}