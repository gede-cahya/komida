'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, BookOpen, User, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Home", href: "/", icon: BookOpen },
    { label: "Popular", href: "/popular", icon: Flame },
    { label: "Genres", href: "/genres", icon: null },
    { label: "Bookmarks", href: "/bookmarks", icon: null },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setMobileMenuOpen(false); // Close mobile menu if open
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };


    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    scrolled
                        ? "bg-background/80 backdrop-blur-md border-b border-border shadow-lg py-3"
                        : "bg-transparent py-5"
                )}
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform">
                            K
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
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer">
                                <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </button>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search manga..."
                                className="bg-secondary/50 border border-transparent focus:border-primary/50 focus:bg-secondary text-sm rounded-full pl-10 pr-4 py-2 w-64 outline-none transition-all placeholder:text-muted-foreground/50 text-white"
                            />
                        </form>
                        <button className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-white">
                            <User className="w-5 h-5" />
                        </button>
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
                        className="fixed inset-0 z-40 bg-background pt-24 px-4 md:hidden"
                    >
                        <div className="flex flex-col gap-4">
                            <form onSubmit={handleSearch} className="relative mb-4">
                                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
