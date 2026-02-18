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
      {
        protocol: 'https',
        hostname: 'media.tenor.com',
      },
      {
        protocol: 'https',
        hostname: 'c.tenor.com',
      },
    ],

  },
  async rewrites() {
    // Get the API URL and ensure it doesn't have trailing slash
    let apiUrl;
    if (process.env.NODE_ENV === 'production') {
      // Force production URL to avoid Vercel env var misconfiguration
      apiUrl = 'https://komida-backend-production.up.railway.app/api';
    } else {
      apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
    }

    // Remove trailing slash if present
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }

    // Extract base URL without /api suffix if present
    const backendUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

    return [
      {
        source: '/api/image/:path*',
        destination: `https://komida-backend-production.up.railway.app/api/image/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate, no-transform',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
