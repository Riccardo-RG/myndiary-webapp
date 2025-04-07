/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    loader: "custom",
    loaderFile: "./src/lib/supabase-image-loader.js",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lvwxnmziosumfdnxlpxx.supabase.co",
        port: "",
        pathname: "/storage/v1/**",
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
