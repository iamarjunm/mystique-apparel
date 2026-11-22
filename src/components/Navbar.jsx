"use client";

import { useState, useEffect, useRef } from "react";
import { FiShoppingBag, FiHeart, FiMenu, FiX, FiUser, FiChevronDown, FiSearch } from "react-icons/fi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { client } from "../../sanity";
import { fetchProducts } from "@/lib/fetchProducts";
import formatCurrency from "@/lib/formatCurrency";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileDropdownTimeoutRef = useRef(null);
  const closeTimerRef = useRef(null);

  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const { wishlist } = useWishlist();
  const { cartCount, openCart, openSearch } = useCart();
  const { user, userData, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Over dark cinema hero only at top of homepage when dropdown is closed
  const isHomeHeroOverlay =
    pathname === "/" && !scrolled && !isShopDropdownOpen;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 36);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsShopDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchNavData = async () => {
      try {
        const [collData, catData, prodData] = await Promise.all([
          client.fetch(`*[_type == "collection"][0...5]{ _id, title, slug }`),
          client.fetch(`*[_type == "category"][0...6]{ _id, title, slug }`),
          fetchProducts(),
        ]);

        setCollections(collData || []);
        setCategories(catData || []);

        if (Array.isArray(prodData) && prodData.length > 0) {
          const featured = prodData.filter((p) => p.featured);
          setFeaturedProducts((featured.length > 0 ? featured : prodData).slice(0, 2));
        }
      } catch (error) {
        console.error("[NAVBAR] Error fetching nav data:", error);
      }
    };
    fetchNavData();
  }, []);

  const openMenu = () => {
    clearTimeout(closeTimerRef.current);
    setIsShopDropdownOpen(true);
  };

  const closeMenu = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsShopDropdownOpen(false);
    }, 150);
  };

  const handleProfileMouseEnter = () => {
    clearTimeout(profileDropdownTimeoutRef.current);
    setIsProfileDropdownOpen(true);
  };

  const handleProfileMouseLeave = () => {
    profileDropdownTimeoutRef.current = setTimeout(() => {
      setIsProfileDropdownOpen(false);
    }, 150);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("[NAVBAR] Logout error:", error);
    }
  };

  const loggedInProfileItems = [
    { name: "My Account", href: "/account" },
    { name: "Track Orders", href: "https://mystiqueapparel.shiprocket.co/", external: true },
    ...(userData?.isAdmin ? [{ name: "Admin Portal", href: "/admin" }] : []),
    { name: "Logout", onClick: handleLogout },
  ];

  const loggedOutProfileItems = [
    { name: "Sign In", href: "/account/login" },
    { name: "Create Account", href: "/account/register" },
  ];

  return (
    <>
      <div className="w-full relative z-40">
        <header
          className={`w-full h-[64px] flex items-center justify-between px-5 sm:px-8 md:px-12 transition-all duration-300 ${
            isHomeHeroOverlay
              ? "bg-transparent text-[#F4F2ED] border-b border-white/[0.1]"
              : "bg-[#F6F5F1]/95 backdrop-blur-md text-[#0D0D0D] border-b border-[#0D0D0D]/10"
          }`}
        >
          {/* Left: Navigation (Desktop) / Menu Trigger (Mobile) */}
          <div className="flex items-center gap-8 flex-1">
            <button
              type="button"
              className="md:hidden p-1 transition-opacity hover:opacity-65"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu className="text-[20px] stroke-[1.5px]" />
            </button>

            <nav className="hidden md:flex gap-8 items-center h-full">
              <div
                className="h-full flex items-center"
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
              >
                <Link
                  href="/shop"
                  onClick={() => setIsShopDropdownOpen(false)}
                  className="font-body text-[11px] font-medium tracking-[0.22em] uppercase cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-65 py-5"
                >
                  Archive
                  <FiChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      isShopDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </Link>
              </div>

              <Link
                href="/shop?newArrival=true"
                className="font-body text-[11px] font-medium tracking-[0.22em] uppercase transition-opacity hover:opacity-65"
              >
                New Drops
              </Link>

              <Link
                href="/about"
                className="font-body text-[11px] font-medium tracking-[0.22em] uppercase transition-opacity hover:opacity-65"
              >
                Atelier
              </Link>

              <Link
                href="/contact"
                className="font-body text-[11px] font-medium tracking-[0.22em] uppercase transition-opacity hover:opacity-65"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Center: Iconic Brand Wordmark Logo */}
          <Link href="/" className="flex items-center justify-center group">
            <img
              src="https://cdn.shopify.com/s/files/1/0591/7045/5631/files/mystique_white.webp?v=1717770206"
              alt="Mystique Apparel"
              className={`h-9 md:h-11 object-contain transition-all duration-300 group-hover:opacity-75 ${
                isHomeHeroOverlay ? "" : "brightness-0"
              }`}
            />
          </Link>

          {/* Right: Utility Actions */}
          <div className="flex items-center justify-end gap-4 sm:gap-5 flex-1">
            {/* Search */}
            <button
              type="button"
              onClick={openSearch}
              className="flex items-center gap-2 transition-opacity hover:opacity-65"
              aria-label="Search archive"
              title="Search (Ctrl+K)"
            >
              <FiSearch className="text-[16px] stroke-[1.6px]" />
              <span className="hidden lg:inline font-mono-tech text-[10px] tracking-[0.18em] uppercase opacity-65">
                Search
              </span>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative transition-opacity hover:opacity-65 p-1"
              aria-label="Wishlist"
            >
              <FiHeart className="text-[16px] stroke-[1.6px]" />
              {wishlist.length > 0 && (
                <span
                  className={`absolute -top-0.5 -right-1 min-w-[15px] h-[15px] px-1 text-[9px] font-mono-tech font-semibold flex items-center justify-center ${
                    isHomeHeroOverlay
                      ? "bg-[#F4F2ED] text-[#0A0A0A]"
                      : "bg-[#0D0D0D] text-[#F6F5F1]"
                  }`}
                >
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Account Dropdown (Desktop) */}
            <div
              className="relative hidden md:flex h-full items-center"
              onMouseEnter={handleProfileMouseEnter}
              onMouseLeave={handleProfileMouseLeave}
            >
              <button
                type="button"
                onClick={() => router.push(user ? "/account" : "/account/login")}
                className="transition-opacity hover:opacity-65 flex items-center h-full py-5 p-1"
                aria-label="Account"
              >
                <FiUser className="text-[16px] stroke-[1.6px]" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute top-[60px] right-0 bg-[#F6F5F1] text-[#0D0D0D] border border-[#0D0D0D]/15 shadow-[0_20px_50px_rgba(0,0,0,0.14)] py-2 w-52 z-50 animate-fade-in-up">
                  {user && (
                    <div className="px-4 py-2.5 border-b border-[#0D0D0D]/10 mb-1">
                      <p className="font-body text-xs font-semibold text-[#0D0D0D] truncate">
                        {userData?.displayName || user.displayName || "Member"}
                      </p>
                      <p className="font-mono-tech text-[9px] text-[#64625C] truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  )}
                  {(user ? loggedInProfileItems : loggedOutProfileItems).map((item) =>
                    item.onClick ? (
                      <button
                        key={item.name}
                        type="button"
                        onClick={item.onClick}
                        className="w-full text-left block px-4 py-2.5 font-mono-tech text-[10px] tracking-[0.2em] uppercase text-red-700 hover:bg-[#0D0D0D]/5 transition-colors"
                      >
                        {item.name}
                      </button>
                    ) : item.external ? (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2.5 font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#0D0D0D]/75 hover:text-[#0D0D0D] hover:bg-[#0D0D0D]/5 transition-colors"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2.5 font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#0D0D0D]/75 hover:text-[#0D0D0D] hover:bg-[#0D0D0D]/5 transition-colors"
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Bag Drawer Trigger */}
            <button
              type="button"
              onClick={openCart}
              className="relative flex items-center gap-1.5 transition-opacity hover:opacity-65 p-1"
              aria-label="Open shopping bag"
            >
              <FiShoppingBag className="text-[16px] stroke-[1.6px]" />
              <span className="font-mono-tech text-[10px] tracking-[0.12em]">
                ({cartCount})
              </span>
            </button>
          </div>
        </header>

        {/* ARCHITECTURAL MEGA MENU (Desktop) */}
        <div
          id="mega-wrap"
          onMouseEnter={openMenu}
          onMouseLeave={closeMenu}
          className={`absolute top-full left-0 w-full z-40 overflow-hidden transition-[max-height] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] hidden md:block ${
            isShopDropdownOpen ? "max-h-[460px]" : "max-h-0"
          }`}
        >
          <div
            className={`bg-[#F6F5F1] text-[#0D0D0D] border-b border-[#0D0D0D]/12 shadow-[0_30px_70px_rgba(0,0,0,0.12)] grid grid-cols-[1fr_1fr_1fr_1.6fr] transition-opacity duration-300 ${
              isShopDropdownOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Col 1: Categories */}
            <div className="p-9 border-r border-[#0D0D0D]/10">
              <div className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#64625C] mb-5">
                Categories
              </div>
              <ul className="flex flex-col gap-3 list-none">
                <li>
                  <Link
                    href="/shop"
                    onClick={() => setIsShopDropdownOpen(false)}
                    className="font-body text-xs tracking-[0.16em] uppercase text-[#0D0D0D] font-medium hover:opacity-60 transition-opacity"
                  >
                    All Archive Pieces
                  </Link>
                </li>
                {categories.map((c, i) => (
                  <li key={c._id || i}>
                    <Link
                      href={`/shop?category=${c.slug?.current || c.slug}`}
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="font-body text-xs tracking-[0.14em] uppercase text-[#0D0D0D]/70 hover:text-[#0D0D0D] transition-colors flex items-center gap-2"
                    >
                      <span>{c.title}</span>
                      {i === 0 && (
                        <span className="font-mono-tech text-[8px] uppercase px-1.5 py-0.5 bg-[#0D0D0D] text-[#F6F5F1]">
                          New
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 2: Collections */}
            <div className="p-9 border-r border-[#0D0D0D]/10">
              <div className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#64625C] mb-5">
                Collections
              </div>
              <ul className="flex flex-col gap-3 list-none">
                {collections.length > 0 ? (
                  collections.map((c, i) => (
                    <li key={c._id || i}>
                      <Link
                        href={`/shop?collection=${c.slug?.current || c.slug}`}
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="font-display italic text-[17px] text-[#0D0D0D]/80 hover:text-[#0D0D0D] transition-colors"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="font-display italic text-base text-[#64625C]">
                    Seasonal Capsules
                  </li>
                )}
              </ul>
            </div>

            {/* Col 3: Curated Links */}
            <div className="p-9 border-r border-[#0D0D0D]/10 flex flex-col justify-between">
              <div>
                <div className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#64625C] mb-5">
                  Editorial
                </div>
                <p className="font-display italic text-2xl text-[#0D0D0D] leading-snug mb-3">
                  Dressed for
                  <br />
                  the in-between.
                </p>
                <p className="font-body text-xs text-[#64625C] leading-relaxed">
                  240 GSM combed cotton blocks shaped with restrained dark precision.
                </p>
              </div>

              <div className="pt-5 border-t border-[#0D0D0D]/10 flex flex-col gap-2.5">
                <Link
                  href="/shop?newArrival=true"
                  onClick={() => setIsShopDropdownOpen(false)}
                  className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#0D0D0D] hover:opacity-60 transition-opacity"
                >
                  — New Arrivals
                </Link>
                <Link
                  href="/shop?bestseller=true"
                  onClick={() => setIsShopDropdownOpen(false)}
                  className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#0D0D0D] hover:opacity-60 transition-opacity"
                >
                  — Best Sellers
                </Link>
                <Link
                  href="/shop?onSale=true"
                  onClick={() => setIsShopDropdownOpen(false)}
                  className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#0D0D0D] hover:opacity-60 transition-opacity"
                >
                  — Archive Offers
                </Link>
              </div>
            </div>

            {/* Col 4: Studio Feature Cards */}
            <div className="grid grid-cols-2 bg-[#EAE8E2]">
              {featuredProducts.map((p, i) => (
                <Link
                  key={p.id || i}
                  href={`/product/${p.slug?.current || p.slug || p.id}`}
                  onClick={() => setIsShopDropdownOpen(false)}
                  className="relative overflow-hidden group block min-h-[300px] border-r border-[#0D0D0D]/10 last:border-r-0"
                >
                  {p.frontImage && (
                    <img
                      src={p.frontImage}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/35 to-transparent text-[#F4F2ED]">
                    <p className="font-mono-tech text-[8px] tracking-[0.25em] uppercase opacity-75">
                      {i === 0 ? "Featured" : "Core Piece"}
                    </p>
                    <p className="font-display italic text-sm line-clamp-1 mt-0.5">
                      {p.title}
                    </p>
                    <p className="font-mono-tech text-[10px] opacity-85 mt-0.5">
                      {formatCurrency(p.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER (Studio Alabaster) */}
      <div
        className={`fixed inset-0 bg-[#F6F5F1] text-[#0D0D0D] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] z-[75] md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#0D0D0D]/10 h-[64px]">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img
              src="https://cdn.shopify.com/s/files/1/0591/7045/5631/files/mystique_white.webp?v=1717770206"
              alt="Mystique Apparel"
              className="h-9 object-contain brightness-0"
            />
          </Link>
          <button
            type="button"
            className="p-2 text-[#0D0D0D]"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-7 space-y-7">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              openSearch();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#0D0D0D]/15 text-[#64625C] text-xs font-body"
          >
            <FiSearch className="text-[#0D0D0D]" />
            <span>Search silhouettes, tees, hoodies...</span>
          </button>

          <div className="space-y-4">
            <button
              type="button"
              className="flex items-center justify-between w-full font-display italic text-3xl text-[#0D0D0D]"
              onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
            >
              <span>Archive</span>
              <FiChevronDown
                className={`text-xl transition-transform duration-300 ${
                  isMobileShopOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isMobileShopOpen && (
              <div className="pl-3 space-y-5 animate-fadeIn">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-1.5 bg-[#0D0D0D] text-[#F6F5F1] font-mono-tech text-[10px] tracking-[0.2em] uppercase"
                  >
                    All Pieces
                  </Link>
                  <Link
                    href="/shop?newArrival=true"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-1.5 border border-[#0D0D0D]/20 text-[#0D0D0D] font-mono-tech text-[10px] tracking-[0.2em] uppercase"
                  >
                    New Drops
                  </Link>
                  <Link
                    href="/shop?bestseller=true"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-1.5 border border-[#0D0D0D]/20 text-[#0D0D0D] font-mono-tech text-[10px] tracking-[0.2em] uppercase"
                  >
                    Bestsellers
                  </Link>
                </div>

                {categories.length > 0 && (
                  <div className="space-y-2.5 border-l border-[#0D0D0D]/15 pl-4">
                    {categories.map((item) => (
                      <Link
                        key={item._id}
                        href={`/shop?category=${item.slug?.current || item.slug}`}
                        className="block font-body text-xs tracking-[0.18em] uppercase text-[#0D0D0D]/75 hover:text-[#0D0D0D]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-5 border-t border-[#0D0D0D]/10">
            {[
              { label: "Atelier", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Wishlist", href: "/wishlist" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block font-display italic text-3xl text-[#0D0D0D]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-5 border-t border-[#0D0D0D]/10 space-y-3">
            <p className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#64625C]">
              Account
            </p>
            {(user ? loggedInProfileItems : loggedOutProfileItems).map((item) =>
              item.onClick ? (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block font-mono-tech text-xs tracking-[0.2em] uppercase text-red-700"
                >
                  {item.name}
                </button>
              ) : item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block font-mono-tech text-xs tracking-[0.2em] uppercase text-[#0D0D0D]/75"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block font-mono-tech text-xs tracking-[0.2em] uppercase text-[#0D0D0D]/75"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
