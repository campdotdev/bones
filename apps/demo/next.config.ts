import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["bones"],
  // lib/pokeapi.ts reads the snapshot with fs, which output tracing can't see.
  outputFileTracingIncludes: {
    "/*": ["data/**/*.json"],
  },
  images: {
    // Sprites load in the browser straight from GitHub. The optimizer would
    // fetch them server-side, which was the other half of BON-23's timeouts.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/**",
      },
    ],
  },
};

export default nextConfig;
