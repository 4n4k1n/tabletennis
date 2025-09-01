import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;