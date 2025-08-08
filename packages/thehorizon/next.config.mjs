/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@radix-ui/react-use-effect-event"],
  webpack(config) {
    config.resolve.alias["@radix-ui/react-use-effect-event"] = path.resolve(
      __dirname,
      "src/stubs/use-effect-event.js"
    );

    // Explicitly set up the @ alias
    config.resolve.alias["@"] = path.resolve(__dirname, "src");

    return config;
  },
};

export default nextConfig;
