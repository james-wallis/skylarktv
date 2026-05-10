/** @type {import('next').NextConfig} */

// eslint-disable-next-line import/no-extraneous-dependencies
const nextTranslate = require("next-translate-plugin");
const { withPlausibleProxy } = require("next-plausible");

const isElectronBuild = process.env.BUILD_TARGET === "electron";

const baseConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_IS_ELECTRON_BUILD: isElectronBuild ? "true" : "",
  },
  ...(isElectronBuild && {
    output: "export",
    images: { unoptimized: true },
    trailingSlash: true,
  }),
};

const moduleExports = withPlausibleProxy()(baseConfig);

// next-translate-plugin injects Next.js i18n config, which is incompatible
// with output: 'export'. Skip it for the Electron build; the app falls back
// to the default locale baked in by useTranslation.
module.exports = isElectronBuild ? moduleExports : nextTranslate(moduleExports);
