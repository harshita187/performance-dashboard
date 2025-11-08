/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
