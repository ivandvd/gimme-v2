import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    /* fewer candidate widths than the defaults: a shorter srcset on every
       picture (the home page carries about forty) and more cache hits on the
       optimizer; 2560 and 3840 exist for the 4K hero photos on big screens */
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560, 3840],
    imageSizes: [96, 160, 256, 384],
    /* 85 for the photo tiles (75 softened them visibly), 90 for the hero,
       where the optimizer's WebP is then indistinguishable from the file at
       full width; 75 stays for small pieces like avatars and menu thumbnails */
    qualities: [75, 85, 90],
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
