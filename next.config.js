/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL;
    if (!backend) return [];
    // Proxy /api/v1 to backend so browser uses same origin (no CORS in dev)
    return [{ source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` }];
  },
};

module.exports = nextConfig;
