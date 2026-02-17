import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Facebook, Instagram } from "lucide-react";


export function Footer() {
    return (
        <footer className="border-t border-border bg-card text-card-foreground mt-20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 group-hover:scale-110 transition-transform duration-300 rounded-xl overflow-hidden bg-white/10 p-1">
                                <Image
                                    src="/logo.png"
                                    alt="Komida Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                                KOMIDA
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm">
                            Baca Manga, Manhwa, dan Manhua online gratis dengan update harian dan koleksi lengkap di Komida.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-foreground mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/popular" className="hover:text-primary transition-colors">Popular</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Latest Updates</Link></li>
                            <li><Link href="/genres" className="hover:text-primary transition-colors">Genres</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">DMCA</Link></li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div>
                        <h4 className="font-bold text-foreground mb-4">Connect</h4>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-secondary rounded-full hover:bg-primary hover:text-white transition-all text-muted-foreground">
                                <Twitter className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="p-2 bg-secondary rounded-full hover:bg-primary hover:text-white transition-all text-muted-foreground">
                                <Github className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="p-2 bg-secondary rounded-full hover:bg-primary hover:text-white transition-all text-muted-foreground">
                                <Instagram className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="p-2 bg-secondary rounded-full hover:bg-primary hover:text-white transition-all text-muted-foreground">
                                <Facebook className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Komida. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
