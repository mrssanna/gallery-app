import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isGithubPages = process.env.IS_GITHUB_PAGES === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isGithubPages ? '/gallery-app/admin/' : '/',
  server: {
    port: 3000,
    host: true, // Обязательно для работы внутри Docker
    watch: {
      usePolling: true,
    },
    proxy: {
      // Все запросы, начинающиеся с /api, будут перенаправляться на бэкенд
      '/api': {
        // Обращаемся к бэкенду по имени контейнера во внутренней сети Docker
        target: 'http://backend:3001',
        changeOrigin: true,
        // Убираем префикс /api перед отправкой на бэкенд
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
