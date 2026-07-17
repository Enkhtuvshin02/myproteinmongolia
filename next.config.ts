import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shop.mn" },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
