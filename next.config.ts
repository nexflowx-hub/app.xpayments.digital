import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,

  // ─── Vercel Deployment ──────────────────────────────────────────────
  // Allow the Vercel preview domain to access Next.js dev resources.
  allowedDevOrigins: [
    "https://app.xpayments.digital",
    "https://*.vercel.app",
    "https://*.space-z.ai",
  ],

  // ─── Image Optimization ────────────────────────────────────────────
  // Allow external images (product images, merchant logos, etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pay.xpayments.digital",
      },
      {
        protocol: "https",
        hostname: "api.xpayments.digital",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;