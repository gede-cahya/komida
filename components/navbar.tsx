"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Menu,
  X,
  BookOpen,
  User,
  Flame,
  Trophy,
  LogOut,
  Settings,
  LayoutDashboard,
  Tag,
  Bookmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";
import { ThemePicker } from "./theme-picker";
import { useAuth } from "@/lib/auth";
import { LoginModal } from "./login-modal";
import { AvatarWithDecoration } from "./avatar-with-decoration";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: BookOpen },
  { label: "Popular", href: "/popular", icon: Flame },
  { label: "Genres", href: "/genres", icon: Tag },
  { label: "Quests", href: "/quests", icon: Trophy },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileMenuOpen(false); // Close mobile menu if open
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide Navbar on specific routes
  if (pathname.startsWith("/admin")) return null;

  // Check for Reader Page: /type/slug/chapter (3 segments)
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length >= 3 &&
    ["manga", "manhwa", "manhua"].includes(segments[0])
  ) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-lg py-3"
            : "bg-transparent py-5",
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 group-hover:scale-110 transition-transform duration-300 rounded-xl overflow-hidden">
              <Image
                src="/logo.png"
                alt="Komida Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              KOMIDA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative group">
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
              >
                <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search manga..."
                className="bg-secondary/50 border border-transparent focus:border-primary/50 focus:bg-secondary text-sm rounded-full pl-10 pr-4 py-2 w-64 outline-none transition-all text-white"
              />
            </form>
            <ThemePicker />
            <UserMenu />
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-4 pb-8 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-4">
              <form onSubmit={handleSearch} className="relative mb-4">
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                >
                  <Search className="w-5 h-5 text-muted-foreground" />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manga..."
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 outline-none text-white focus:border-primary/50 transition-colors"
                />
              </form>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-white p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-border pt-4 mt-2 flex items-center justify-between">
                <span className="text-muted-foreground font-medium">
                  Appearance
                </span>
                <ThemePicker />
              </div>

              <div className="border-t border-border pt-4 mt-2">
                {user ? (
                  <div className="space-y-1">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-2 py-3 mb-1">
                      <AvatarWithDecoration
                        src={user.avatar_url || ""}
                        fallback={user.username.slice(0, 2).toUpperCase()}
                        decorationUrl={user.decoration_url}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">
                          {user.display_name || user.username}
                        </p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>

                    {user.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-white p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Link>
                    )}

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-white p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 text-lg font-medium text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-white p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Login / Register
                    </button>
                    <LoginModal
                      isOpen={showLoginModal}
                      onClose={() => setShowLoginModal(false)}
                    />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
