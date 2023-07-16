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
  generateStaticParams: function () {
    return {
      "/": { page: "/" },
      "/en": { page: "/[lang]" },
      "/en-US": { page: "/[lang]" },
      "/pt-BR": { page: "/[lang]" },
      "/en/legere": { page: "/[lang]/legere" },
      "/en-US/legere": { page: "/[lang]/legere" },
      "/pt-BR/legere": { page: "/[lang]/legere" },
    };
  },
};

module.exports = nextConfig;
