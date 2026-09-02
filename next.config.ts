import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {source: "/about", destination: "/", permanent: true},
      {source: "/archive", destination: "/writing", permanent: true},
      {source: "/gallery", destination: "/showcase", permanent: true},
      {source: "/products", destination: "/showcase", permanent: true},
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "framerusercontent.com" },
    ],
  },
};

export default nextConfig;
