import type { NextConfig } from "next";

// Для GitHub Pages сайт живёт в подпапке (/имя-репозитория), её задаём при сборке:
// NEXT_PUBLIC_BASE_PATH=/glad npm run build
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
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
