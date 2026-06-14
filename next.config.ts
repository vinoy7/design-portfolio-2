import type { NextConfig } from "next";

// GitHub Pages serves this repo under /design-portfolio-2.
// Static export (`output: export`) is required for Pages; it disallows rewrites,
// so the case study is reached via its static file at /designing-trust/.
const repo = "design-portfolio-2";

const nextConfig: NextConfig = {
  output: "export",
  basePath: `/${repo}`,
  trailingSlash: true,
  images: {
    unoptimized: true,
    localPatterns: [
      {
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
