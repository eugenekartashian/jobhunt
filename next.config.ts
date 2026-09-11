import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@browserbasehq/stagehand", "@browserbasehq/sdk"],
};

export default nextConfig;
