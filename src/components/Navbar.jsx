"use client";

import { useState, useEffect, useRef } from "react";
import { FiShoppingCart, FiHeart, FiMenu, FiX, FiUser, FiChevronDown } from "react-icons/fi";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { client } from "../../sanity";
import { fetchProducts } from "@/lib/fetchProducts";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownTimeoutRef = useRef(null);
  const shopDropdownTimeoutRef = useRef(null);
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const { user, userData, signOut } = useAuth();
  const router = useRouter();
  
  const closeTimerRef = useRef(null);

  // Fetch collections, categories, and featured products from Sanity
  useEffect(() => {
    const fetchNavData = async () => {
      try {
        const collQuery = `*[_type == "collection"][0...5]{ _id, title, slug }`;
        const collData = await client.fetch(collQuery);
        setCollections(collData || []);

        const catQuery = `*[_type == "category"][0...6]{ _id, title, slug }`;
        const catData = await client.fetch(catQuery);
        setCategories(catData || []);

        const prodData = await fetchProducts();
        setFeaturedProducts(prodData ? prodData.slice(0, 2) : []);
      } catch (error) {
        console.error('[NAVBAR] Error fetching nav data:', error);
      }
    };
    fetchNavData();
  }, []);

  // Dropdown Hover Logic (matching the smooth delay from the HTML script)
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
    if (profileDropdownTimeoutRef.current) {
      clearTimeout(profileDropdownTimeoutRef.current);
    }
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
      router.push("/");
    } catch (error) {
      console.error('[NAVBAR] Logout error:', error);
    }
  };

  const loggedInProfileItems = [
    { name: "My Account", href: "/account" },
    { name: "Track Orders", href: "https://mystiqueapparel.shiprocket.co/" },
    ...(userData?.isAdmin ? [{ name: "Admin Portal", href: "/admin" }] : []),
    { name: "Logout", onClick: handleLogout },
  ];

  const loggedOutProfileItems = [
    { name: "Login", href: "/account/login" },
    { name: "Register", href: "/account/register" },
  ];

  return (
    <>
      <div className="w-full relative z-40">
        {/* NAVBAR */}
        <header className="w-full bg-gradient-to-br from-black via-gray-950/60 to-black/80 backdrop-blur-lg text-white shadow-[0px_10px_30px_rgba(255,255,255,0.05)] h-[64px] flex items-center justify-between px-6 md:px-12">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="https://cdn.shopify.com/s/files/1/0591/7045/5631/files/mystique_white.webp?v=1717770206"
            alt="Mystique Logo"
            className="h-10 md:h-12 object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-10 items-center h-full">
          {/* Shop Dropdown Trigger */}
          <div 
            className="h-full flex items-center"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
          >
            <Link 
              href="/shop"
              onClick={() => setIsShopDropdownOpen(false)}
              className={`font-sans text-[12px] tracking-[0.2em] uppercase cursor-pointer flex items-center gap-1.5 transition-colors duration-200 select-none py-[22px] ${isShopDropdownOpen ? 'text-white' : 'text-white/75 hover:text-white'}`}
            >
              Shop 
              <span className={`inline-block w-[10px] h-[10px] border-r-[1.5px] border-b-[1.5px] border-current transition-transform duration-300 ease-in-out ${isShopDropdownOpen ? 'rotate-[225deg] -translate-y-[2px]' : 'rotate-45 -translate-y-[2px]'}`}></span>
            </Link>
          </div>

          {["About", "Contact"].map((item) => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase()}`} 
              className="font-sans text-[12px] tracking-[0.2em] uppercase text-white/75 hover:text-white cursor-pointer transition-colors duration-200"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-5">
          {/* Wishlist */}
          <Link href="/wishlist" className="relative text-white/75 hover:text-white transition-colors duration-200">
            <FiHeart className="text-[18px] stroke-[1.5px]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-white text-black text-[9px] font-bold px-1 rounded shadow-md">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative text-white/75 hover:text-white transition-colors duration-200">
            <FiShoppingCart className="text-[18px] stroke-[1.5px]" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-white text-black text-[9px] font-bold px-1 rounded shadow-md">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Profile Dropdown (Desktop) */}
          <div
            className="relative group hidden md:block h-full flex items-center"
            onMouseEnter={handleProfileMouseEnter}
            onMouseLeave={handleProfileMouseLeave}
          >
            <button className="text-white/75 hover:text-white transition-colors duration-200 flex items-center h-full py-[22px]">
              <FiUser className="text-[18px] stroke-[1.5px]" />
            </button>
            
            {isProfileDropdownOpen && (
              <div className="absolute top-[64px] right-0 bg-[#0a0a0a] border border-white/10 rounded-sm shadow-2xl py-2 w-48 z-50">
                {user
                  ? loggedInProfileItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href || "#"}
                        onClick={item.onClick}
                        className="block px-5 py-2.5 font-sans text-[11px] tracking-[0.15em] uppercase text-white/60 hover:text-white hover:bg-white/5 transition-all"
                      >
                        {item.name}
                      </Link>
                    ))
                  : loggedOutProfileItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-5 py-2.5 font-sans text-[11px] tracking-[0.15em] uppercase text-white/60 hover:text-white hover:bg-white/5 transition-all"
                      >
                        {item.name}
                      </Link>
                    ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white/75 hover:text-white transition-colors duration-200" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <FiMenu className="text-[20px] stroke-[1.5px]" />
          </button>
        </div>
      </header>

      {/* MEGA DROPDOWN (Desktop) */}
      <div 
        id="mega-wrap"
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
        className={`absolute top-full left-0 w-full z-40 overflow-hidden transition-[max-height] duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] hidden md:block ${isShopDropdownOpen ? 'max-h-[520px]' : 'max-h-0'}`}
      >
        <div className={`bg-[#0a0a0a] border-b border-white/10 grid grid-cols-[1fr_1fr_1fr_1.8fr] transition-all duration-[400ms] delay-75 ${isShopDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
          
          {/* Col 1: Categories */}
          <div className="p-[48px_40px] border-r border-white/5">
            <div className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/25 mb-7">Categories</div>
            <ul className="flex flex-col gap-4 list-none">
              <li>
                <Link href="/shop" onClick={() => setIsShopDropdownOpen(false)} className="group font-sans text-[12px] tracking-[0.15em] uppercase text-white/60 hover:text-white flex items-center transition-colors duration-250">
                  <span className="inline-block w-0 h-[1px] bg-white mr-0 transition-all duration-300 flex-shrink-0 group-hover:w-[18px] group-hover:mr-[10px]"></span>
                  All Products
                </Link>
              </li>
              {categories.map((c, i) => (
                <li key={i}>
                  <Link href={`/shop?category=${c.slug?.current || c.slug}`} onClick={() => setIsShopDropdownOpen(false)} className="group font-sans text-[12px] tracking-[0.15em] uppercase text-white/60 hover:text-white flex items-center transition-colors duration-250">
                    <span className="inline-block w-0 h-[1px] bg-white mr-0 transition-all duration-300 flex-shrink-0 group-hover:w-[18px] group-hover:mr-[10px]"></span>
                    {c.title}
                    {i === 0 && <span className="font-sans text-[8px] tracking-[0.15em] uppercase bg-white text-black px-[6px] py-[2px] ml-[10px] rounded-[2px] flex-shrink-0">New</span>}
                  </Link>
                </li>
              ))}
            </ul>


          </div>

          {/* Col 2: Collections */}
          <div className="p-[48px_40px] border-r border-white/5">
            <div className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/25 mb-7">Collections</div>
            <ul className="flex flex-col gap-3 list-none">
              {collections.map((c, i) => (
                <li key={i}>
                  <Link href={`/shop?collection=${c.slug?.current || c.slug}`} onClick={() => setIsShopDropdownOpen(false)} className="group font-serif italic text-[14px] text-white/55 hover:text-white flex items-baseline gap-2 transition-colors duration-250">
                    <span>{c.title}</span>
                    <span className="font-sans not-italic text-[9px] text-white/20 tracking-[0.1em] mt-[1px] group-hover:text-white/50">Explore</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Editorial */}
          <div className="p-[48px_40px] border-r border-white/5 flex flex-col justify-between">
            <div>
              <div className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/25 mb-7">Editorial</div>
              <div className="font-serif italic text-[22px] text-white/90 leading-[1.4] mb-4">
                Dressed for<br/>the in-between.
              </div>
              <div className="font-sans text-[11px] tracking-[0.1em] text-white/35 leading-[1.7] max-w-[200px]">
                Summer's edge — pieces that move between the heat of day and the cool of night.
              </div>
            </div>

            <div>
              <div className="h-[1px] bg-white/5 mb-5"></div>
              <div className="flex flex-col gap-2.5">
                <Link href="/shop?newArrival=true" onClick={() => setIsShopDropdownOpen(false)} className="group font-sans text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white flex items-center gap-2 transition-colors duration-200">
                  <span className="inline-block w-[18px] h-[1px] bg-current flex-shrink-0"></span>
                  New Arrivals
                </Link>
                <Link href="/shop?bestseller=true" onClick={() => setIsShopDropdownOpen(false)} className="group font-sans text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white flex items-center gap-2 transition-colors duration-200">
                  <span className="inline-block w-[18px] h-[1px] bg-current flex-shrink-0"></span>
                  Best Sellers
                </Link>
              </div>
            </div>
          </div>

          {/* Col 4: Featured Products */}
          <div className="grid grid-cols-2 relative overflow-hidden h-full">
            {featuredProducts.map((p, i) => (
              <Link 
                key={i} 
                href={`/product/${p.slug?.current || p.slug}`} 
                onClick={() => setIsShopDropdownOpen(false)}
                className="relative cursor-pointer overflow-hidden group block h-full"
              >
                {p.frontImage ? (
                  <img src={p.frontImage} alt={p.title} className="w-full h-full object-cover brightness-[0.65] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:brightness-80 group-hover:scale-[1.04]" />
                ) : (
                  <div className={`w-full h-full min-h-[220px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] ${i === 0 ? 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]' : 'bg-gradient-to-br from-[#2d1b2e] via-[#1a0a1a] to-[#3d0c3d]'}`}></div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/85 to-transparent pointer-events-none">
                  <div className="font-sans text-[8px] tracking-[0.25em] uppercase text-white/45 mb-1.5">{i === 0 ? 'New In' : 'Best Seller'}</div>
                  <div className="font-serif text-[13px] text-white leading-[1.3]">{p.title}</div>
                  <div className="font-sans text-[11px] tracking-[0.1em] text-white/60 mt-1">₹{p.price}</div>
                </div>
              </Link>
            ))}

            <Link 
              href="/shop" 
              onClick={() => setIsShopDropdownOpen(false)}
              className="absolute bottom-4 right-4 font-sans text-[9px] tracking-[0.25em] uppercase text-white/50 border border-white/20 px-3.5 py-2 bg-black/50 backdrop-blur-[4px] hover:text-white hover:border-white/60 hover:bg-black/80 transition-all duration-200 z-10"
            >
              View All →
            </Link>
          </div>
        </div>
      </div>
      </div>

      {/* MOBILE MENU SIDEBAR */}
      <div className={`fixed top-0 left-0 w-full h-screen bg-[#0a0a0a] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-[60] md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 h-[64px]">
          <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img
              src="https://cdn.shopify.com/s/files/1/0591/7045/5631/files/mystique_white.webp?v=1717770206"
              alt="Mystique Logo"
              className="h-10 object-contain"
            />
          </Link>
          <button className="text-[24px] text-white/75 hover:text-white transition-colors duration-300" onClick={() => setIsOpen(false)}>
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          {/* Shop Accordion */}
          <div className="space-y-4">
            <button
              className="flex items-center justify-between w-full font-serif text-[20px] text-white"
              onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
            >
              <span className="tracking-wide">Shop</span>
              <FiChevronDown className={`transition-transform duration-300 ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isShopDropdownOpen && (
              <div className="pl-4 space-y-8 animate-fadeIn">
                <div>
                  <Link href="/shop" className="block font-sans text-[12px] tracking-[0.2em] uppercase text-white mb-4" onClick={() => setIsOpen(false)}>
                    All Products
                  </Link>
                </div>

                <div>
                  <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/25 mb-4">Categories</p>
                  <div className="space-y-4 border-l border-white/10 pl-4">
                    {categories.map((item) => (
                      <Link
                        key={item._id}
                        href={`/shop?category=${item.slug?.current || item.slug}`}
                        className="block font-sans text-[11px] tracking-[0.15em] uppercase text-white/60 hover:text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/25 mb-4">Collections</p>
                  <div className="space-y-4 border-l border-white/10 pl-4">
                    {collections.map((item) => (
                      <Link
                        key={item._id}
                        href={`/shop?collection=${item.slug?.current || item.slug}`}
                        className="block font-serif italic text-[15px] text-white/55 hover:text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other Links */}
          {["About", "Contact"].map((item) => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase()}`} 
              className="block font-serif text-[20px] text-white tracking-wide" 
              onClick={() => setIsOpen(false)}
            >
              {item}
            </Link>
          ))}

          {/* Mobile Profile Settings */}
          <div className="pt-8 mt-8 border-t border-white/10 space-y-4">
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/25 mb-4">Account</p>
            <div className="space-y-4">
              {user
                ? loggedInProfileItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href || "#"}
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      className="block font-sans text-[11px] tracking-[0.15em] uppercase text-white/60 hover:text-white"
                    >
                      {item.name}
                    </Link>
                  ))
                : loggedOutProfileItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block font-sans text-[11px] tracking-[0.15em] uppercase text-white/60 hover:text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}