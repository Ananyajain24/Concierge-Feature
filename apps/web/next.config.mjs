/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@lohono/shared-types",
    "@lohono/itinerary-engine",
    "@lohono/map-projection",
  ],
  typedRoutes: false,
};
export default nextConfig;
