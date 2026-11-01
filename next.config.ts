import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid Next inferring a parent workspace root when other lockfiles exist.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
