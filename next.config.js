/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Modify the rule for SVG files
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    )
    return config
  },
  images: {
    disableStaticImages: false,
  }
};

module.exports = nextConfig; 