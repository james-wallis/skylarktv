/** @type {import('next').NextConfig} */

// eslint-disable-next-line import/no-extraneous-dependencies
const nextTranslate = require("next-translate-plugin");
const { withPlausibleProxy } = require("next-plausible");

const isElectronBuild = process.env.BUILD_TARGET === "electron";

const baseConfig = {
  reactStrictMode: true,
  ...(isElectronBuild && {
    output: "export",
    images: { unoptimized: true },
    trailingSlash: true,
  }),
};

const moduleExports = withPlausibleProxy()(baseConfig);

module.exports = nextTranslate(moduleExports);
