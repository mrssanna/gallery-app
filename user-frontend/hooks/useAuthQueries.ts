import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { translateError } from "../utils/error-mapper";

const IS_STATIC = process.env.NEXT_PUBLIC_IS_STATIC === "true";

// Мутация для логина
export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (credentials: { login: string; password: string }) => {
      if (IS_STATIC) {
        // Имитируем задержку сети для демо
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { accessToken: "mock-token-for-demo" };
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorKey =
          data.message?.message || data.message || "Login failed";
        throw new Error(translateError(errorKey));
      }

      return data;
    },
    onSuccess: (data) => {
      // При успешном логине сохраняем токен в контекст (что вызовет редирект на главную)
      login(data.accessToken);
    },
  });
};

// Мутация для регистрации
export const useRegister = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (credentials: { login: string; password: string }) => {
      if (IS_STATIC) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { accessToken: "mock-token-for-demo" };
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorKey =
          data.message?.message || data.message || "Registration failed";
        throw new Error(translateError(errorKey));
      }

      return data;
    },
    onSuccess: (data) => {
      // При успешной регистрации сразу логиним пользователя
      login(data.accessToken);
    },
  });
};
