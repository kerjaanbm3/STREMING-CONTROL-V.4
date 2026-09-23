/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.watchOptions = {
      ignored: [
        '**/live_output_txt/**',
        '**/*.txt',
        '**/prisma/**',
        '**/*.db',
        '**/*.db-journal',
        '**/public/uploads/**',
        '**/.git/**',
        '**/node_modules/**',
      ],
    };
    return config;
  },
};

module.exports = nextConfig;
