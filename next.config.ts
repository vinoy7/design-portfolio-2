import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
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
