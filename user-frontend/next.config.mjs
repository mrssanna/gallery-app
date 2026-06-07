/** @type {import('next').NextConfig} */
const isGithubPages = process.env.IS_GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  // Если собираем для GitHub Pages, включаем экспорт и basePath
  ...(isGithubPages ? {
    output: 'export',
    images: {
      unoptimized: true,
    },
    basePath: '/gallery-app',
  } : {
    // Если запускаем локально, включаем прокси
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://backend:3001/:path*',
        },
      ];
    },
  }),
  // Настраиваем Webpack для корректной работы File Watcher внутри Docker
  webpack: (config, context) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;