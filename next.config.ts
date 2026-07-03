import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    config.resolve.alias['pako/lib/zlib/zstream.js'] = 'pako/lib/zlib/zstream';
    config.resolve.alias['pako/lib/zlib/deflate.js'] = 'pako/lib/zlib/deflate';
    config.resolve.alias['pako/lib/zlib/inflate.js'] = 'pako/lib/zlib/inflate';
    config.resolve.alias['pako/lib/zlib/constants.js'] = 'pako/lib/zlib/constants';
    return config;
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(config);
