import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.openfoodfacts.org",
      },
    ],
  },
};

export default nextConfig;
