/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    appDir: true,
  },
  eslint: {
    dirs: ["app"], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
};

module.exports = nextConfig;
