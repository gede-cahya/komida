import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.envira-cdn.com',
      },
      {
        protocol: 'https',
        hostname: 'kacu.gmbr.pro',
      },
      {
        protocol: 'https',
        hostname: 'cdnxyz.xyz',
      },
      {
        protocol: 'https',
        hostname: 'assets.shngm.id',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com', // Covers i0.wp.com, i1.wp.com, etc.
      },
      {
        protocol: 'https',
        hostname: 'kiryuu03.com',
      },
      {
        protocol: 'https',
        hostname: 'www.manhwaindo.my',
      },
      {
        protocol: 'https',
        hostname: '09.shinigami.asia',
      },
      {
        protocol: 'https',
        hostname: 'image.softkomik.com',
      },
      {
        protocol: 'https',
        hostname: 'image2.softkomik.com',
      },
      {
        protocol: 'https',
        hostname: 'cover.softdevices.my.id',
      },
    ],

  },
  async rewrites() {
    // Get the API URL and ensure it doesn't have trailing slash
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
    // Extract base URL without /api suffix
    const backendUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
