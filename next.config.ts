import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  serverExternalPackages: ["pdf-parse", "@browserbasehq/stagehand", "@browserbasehq/sdk"],
};

export default nextConfig;
