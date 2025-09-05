/** @type {import('next').NextConfig} */

import withPWAInit from "@ducanh2912/next-pwa";

const withPWABase = withPWAInit({
  dest: "public",
  sw: "service-worker.js",
  register: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
});

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuração correta de imagens
  images: {
    domains: ['utfs.io'],
    // REMOVA o remotePatterns ou corrija o tipo
  },
  
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
    MP_PUBLIC_KEY: process.env.MP_PUBLIC_KEY,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  },
};

export default withPWABase(nextConfig);