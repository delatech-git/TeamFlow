import type { NextConfig } from "next";

/** Nest (or other backend) origin. Used only by dev/prod rewrites. */
const backendOrigin =
  process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
