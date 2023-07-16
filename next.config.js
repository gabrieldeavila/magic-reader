/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  experimental: {
    appDir: true,
    serverActions: true,
  },
  i18n: {
    locales: ["en", "pt-BR"],
    defaultLocale: "en",
    localeDetection: false,
  },
};

module.exports = nextConfig;
