const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true" ? true : false;

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  // compiler: {
  //   removeConsole: isProd,
  // },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/x-date-pickers',
      '@mui/icons-material',
    ],
  },
  webpack: (config) => {
    config.externals = [...config.externals, "@tensorflow/tfjs-node"];
    return config;
  },
};

module.exports = nextConfig;
