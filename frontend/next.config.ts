import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '192.168.65.133',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.65.133:3000", "localhost:3001", "192.168.65.133:3001", "localhost:3002", "192.168.65.133:3002"]
    }
  },
};

export default nextConfig;
