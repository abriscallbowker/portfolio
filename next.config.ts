import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{source: "/about", destination: "/", permanent: true}];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "framerusercontent.com" },
    ],
  },
};

export default nextConfig;
