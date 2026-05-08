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
        protocol: 'http',
        hostname: 'kacu.gmbr.pro',
      },
      {
        protocol: 'https',
        hostname: 'kacu.gmbr.pro',
      },
      {
        protocol: 'http',
        hostname: 'image.softkomik.com',
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
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],

    unoptimized: true,
  },
  // Rewrites removed in favor of dynamic API route proxy in app/api/[...path]/route.ts
  // This allows for intelligent failover between Railway and Cloudflare Tunnel

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=600'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
