/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add this line for better Docker performance
  output: 'standalone', 
};

export default nextConfig;