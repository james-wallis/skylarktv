/** @type {import('next').NextConfig} */

const brand = {
  name: process.env.BRAND_NAME || "LocalTV",
  primary: process.env.BRAND_PRIMARY || "#5b45ce",
  accent: process.env.BRAND_ACCENT || "#7760d6",
};

module.exports = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  transpilePackages: ["@skylark-apps/skylarktv"],
  env: {
    NEXT_PUBLIC_BRAND_NAME: brand.name,
    NEXT_PUBLIC_BRAND_PRIMARY: brand.primary,
    NEXT_PUBLIC_BRAND_ACCENT: brand.accent,
  },
};
