import type { NextConfig } from "next";

const NextConfig = {
  async rewrites() {
    return [
      {
        source: '/portfolio',
        destination: '/site/portfolio/index.html',
      },
      {
        source: '/web-video-player',
        destination: '/site/web-video-player/index.html',
      },
      // Add more static site rewrites as needed
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default NextConfig;
