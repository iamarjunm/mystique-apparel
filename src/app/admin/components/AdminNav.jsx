"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Mail,
  Megaphone,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const menuItems = [
  { name: "Overview", href: "/admin", icon: BarChart3 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Emails", href: "/admin/emails", icon: Mail },
  { name: "Contact Forms", href: "/admin/contact-forms", icon: Mail },
  { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { name: "Site Settings", href: "/admin/site-settings", icon: Settings },
];

export default function AdminNav({ onNavigate }) {
  const pathname = usePathname();
  const { logout, userData } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="w-64 bg-gradient-to-br from-gray-950 via-black to-gray-950 border-r border-white/10 overflow-y-auto flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black/40 backdrop-blur-lg border-b border-white/10 p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Admin
        </h1>
        <p className="text-xs text-gray-400 mt-1">Portal</p>
        {userData?.displayName && (
          <p className="text-xs text-gray-500 mt-3 truncate">
            👤 {userData.displayName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-blue-500/30 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/20"
                  : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-lg">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-400 border border-red-500/30 rounded-lg hover:from-red-500/30 hover:to-red-600/20 hover:border-red-500/50 transition-all duration-300 font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
        <p className="text-xs text-gray-500 mt-3 text-center">v1.0.0</p>
      </div>
    </div>
  );
}
