import type { NextConfig } from "next";

const NextConfig = {
  // Enable static HTML export for routes that need it
  output: process.env.NODE_ENV !== "development" ? "export" : "standalone",
  
  // Rewrite static HTML pages
  async rewrites() {
    return [
      {
        source: '/portfolio',
        destination: '/static-site/portfolio/index.html',
      },
      {
        source: '/web-video-player',
        destination: '/static-site/web-video-player/index.html',
      },
      // Add more static site rewrites as needed
    ]
  }
}

export default NextConfig;
