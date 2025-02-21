/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  images: {
    domains: ['vercel.com'], // Add any external image domains you're using
    unoptimized: process.env.NODE_ENV === 'development'
  },
  // Add output configuration for better static optimization
  output: 'standalone',
};

module.exports = nextConfig; 