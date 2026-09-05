import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow uploading field photos as data URLs in the demo store.
  images: { unoptimized: true },
};

export default nextConfig;
