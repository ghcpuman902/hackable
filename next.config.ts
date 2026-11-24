import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.2.137", "*.local", "127.0.0.1", "localhost"],
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
