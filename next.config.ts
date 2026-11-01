import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    /* fewer candidate widths than the defaults: a shorter srcset on every
       picture (the home page carries about forty) and more cache hits on the
       optimizer; the largest photo is 1916 wide, so nothing above 1920 */
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [96, 160, 256, 384],
    /* 75 everywhere, 85 for the hero photos (the first thing anyone sees) */
    qualities: [75, 85],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
