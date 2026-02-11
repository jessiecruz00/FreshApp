import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from external URLs if you use cover_image_url
  images: { remotePatterns: [{ protocol: "https", hostname: "**", pathname: "**" }] },
};

export default nextConfig;
