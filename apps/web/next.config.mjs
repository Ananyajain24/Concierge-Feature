/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@lohono/shared-types",
    "@lohono/itinerary-engine",
    "@lohono/map-projection",
  ],
  experimental: {
    typedRoutes: false,
  },
};
export default nextConfig;
