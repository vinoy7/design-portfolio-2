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
      // Pretty tab URLs all serve the SPA root; client reads the path to pick the tab.
      { source: "/case-studies", destination: "/" },
      { source: "/ui-designs", destination: "/" },
      { source: "/ai", destination: "/" },
      { source: "/about", destination: "/" },
    ];
  },
};

export default nextConfig;
