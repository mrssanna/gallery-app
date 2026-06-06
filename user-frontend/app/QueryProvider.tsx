"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Создаем QueryClient один раз на уровне приложения
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Отключаем автоматический перезапрос при переключении вкладок браузера
            refetchOnWindowFocus: false,
            // Данные считаются "свежими" 1 минуту, чтобы не дергать бэкенд лишний раз
            staleTime: 60 * 1000,
            // Количество попыток при ошибке сети
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools будут видны только в режиме разработки (npm run dev) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
