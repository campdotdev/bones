import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["bones"],
  // lib/pokeapi.ts reads the snapshot with fs, which output tracing can't see.
  outputFileTracingIncludes: {
    "/*": ["data/**/*.json"],
  },
};

export default nextConfig;
