/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  swcMinify: true,
  reactStrictMode: true,
  
  // Explicitly indicate the source directory for pages and app router
  experimental: {
    // Required for src directory structure to work in Next.js 15
    // (Though appDir is no longer experimental, this helps with src folder structure)
    externalDir: true
  }
}

module.exports = nextConfig 