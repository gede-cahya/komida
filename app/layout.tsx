
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { ClientFooter } from "@/components/client-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://komida.site'), // Replace with actual domain if different
  title: {
    default: "Komida | Read Manga, Manhwa, Manhua Online",
    template: "%s | Komida"
  },
  description: "Read your favorite Manga, Manhwa, and Manhua online for free at Komida. High-quality images, daily updates, and a vast collection of comics.",
  keywords: ["manga", "manhwa", "manhua", "read manga online", "free manga", "comics", "webtoon", "komida"],
  authors: [{ name: "Komida Team" }],
  creator: "Komida Team",
  publisher: "Komida",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://komida.site',
    title: 'Komida | Read Manga, Manhwa, Manhua Online',
    description: 'Read your favorite Manga, Manhwa, and Manhua online for free at Komida.',
    siteName: 'Komida',
    images: [
      {
        url: '/logo.png', // Ensure this exists or use a dedicated OG image
        width: 1200,
        height: 630,
        alt: 'Komida - Read Manga Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Komida | Read Manga Online',
    description: 'Read your favorite Manga, Manhwa, and Manhua online for free at Komida.',
    images: ['/logo.png'],
    creator: '@komida', // Placeholder
  },
  icons: {
    icon: '/favicon-v3.png',
    shortcut: '/favicon-v3.png',
    apple: '/favicon-v3.png',
  },
  alternates: {
    canonical: './',
  },
  verification: {
    google: "u4OkBzWkFehCHk-ZoXDZc-3PLLZ0vIWt0K_DtUKwwQw",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <ClientFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
