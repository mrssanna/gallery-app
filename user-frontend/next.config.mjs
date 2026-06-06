/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Настраиваем Webpack для корректной работы File Watcher внутри Docker
  webpack: (config, context) => {
    config.watchOptions = {
      poll: 1000, // Проверять изменения каждую секунду
      aggregateTimeout: 300,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3001/:path*', // Проксируем запросы в контейнер бэкенда
      },
    ];
  },
};

export default nextConfig;
