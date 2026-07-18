import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/digital-nomad-cn',
  assetPrefix: '/digital-nomad-cn/',
  trailingSlash: true,
};

export default nextConfig;
