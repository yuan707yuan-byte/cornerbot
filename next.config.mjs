/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
  },
};

export default nextConfig;
