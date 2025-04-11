"use client";

import { useState } from "react";
import { FiShoppingCart, FiHeart, FiMenu, FiX, FiUser, FiChevronDown } from "react-icons/fi";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext"; // Wishlist context
import { useCart } from "@/context/CartContext"; // Cart context
import { useUser } from "@/context/UserContext"; // User context
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
        { name: "Summer Collection", href: "/collections/summer" },
        { name: "Winter Collection", href: "/collections/winter" },
      ],
    },
    {
      name: "Categories",
      subcategories: [
        { name: "Oversized T-Shirts", href: "/categories/oversized-tshirts" },
        { name: "Joggers", href: "/categories/joggers" },
        { name: "Hoodies", href: "/categories/hoodies" },
      ],
    },
  ];

  // Profile dropdown items for logged-in users
  const loggedInProfileItems = [
    { name: "My Account", href: "/account" },
    { name: "Track Orders", href: "/orders" },
    { name: "Logout", onClick: () => handleLogout() },
  ];

  // Profile dropdown items for logged-out users
  const loggedOutProfileItems = [
    { name: "Login", href: "/account/login" },
    { name: "Register", href: "/account/register" },
  ];

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-lg text-white z-50 shadow-[0px_10px_30px_rgba(255,255,255,0.05)] transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
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
                      {/* Main Category Link */}
                      <Link
                        href={category.href || "#"}
                        className="block px-6 py-2 text-white hover:bg-white/10 transition-all font-semibold text-lg"
                      >
                        {category.name}
                      </Link>
  
                      {/* Subcategories */}
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
            className="relative group"
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
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center gap-8 text-2xl tracking-wide text-white transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Shop Dropdown for Mobile */}
        <div className="relative">
          <button
            className="flex items-center gap-2 hover:text-gray-300"
            onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
          >
            <span>Shop</span>
            <FiChevronDown className="text-xl" />
          </button>
          {isShopDropdownOpen && (
            <div className="mt-4 flex flex-col items-center gap-4">
              {shopCategories.map((category) => (
                <div key={category.name}>
                  {/* Main Category Link */}
                  <Link
                    href={category.href || "#"}
                    className="text-xl hover:text-gray-300"
                    onClick={() => setIsOpen(false)}
                  >
                    {category.name}
                  </Link>
                  {/* Subcategories */}
                  {category.subcategories && (
                    <div className="pl-4">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.name}
                          href={subcategory.href}
                          className="text-xl hover:text-gray-300"
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

        {/* Other Links for Mobile */}
        {["About", "Contact"].map((item) => (
          <Link key={item} href={`/${item.toLowerCase()}`} className="relative group text-3xl" onClick={() => setIsOpen(false)}>
            <span className="hover:text-gray-300">{item}</span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </Link>
        ))}

        {/* Profile Dropdown for Mobile */}
        <div className="relative">
          <button
            className="flex items-center gap-2 hover:text-gray-300"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <FiUser className="text-2xl" />
            <FiChevronDown className="text-xl" />
          </button>
          {isProfileDropdownOpen && (
            <div className="mt-4 flex flex-col items-center gap-4">
              {user
                ? loggedInProfileItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href || "#"}
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      className="text-xl hover:text-gray-300"
                    >
                      {item.name}
                    </Link>
                  ))
                : loggedOutProfileItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-xl hover:text-gray-300"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}