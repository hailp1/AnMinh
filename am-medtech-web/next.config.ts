import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  reactCompiler: true,
  experimental: {
    cpus: 4,
  },
};

export default nextConfig;
