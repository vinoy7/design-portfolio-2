import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/designing-trust", destination: "/designing-trust/index.html" },
    ];
  },
};

export default nextConfig;
