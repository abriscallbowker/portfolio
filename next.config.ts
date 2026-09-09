import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {source: "/showcase", destination: "/", permanent: true},
      {source: "/archive", destination: "/writing", permanent: true},
      {source: "/gallery", destination: "/", permanent: true},
      {source: "/products", destination: "/", permanent: true},
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
