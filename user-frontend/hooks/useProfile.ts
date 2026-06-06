import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, UserProfile } from "../context/AuthContext";

// Хук для получения профиля (GET)
export const useProfile = () => {
  const { token, logout } = useAuth();

  return useQuery<UserProfile, Error>({
    queryKey: ["profile"], // Уникальный ключ для кэширования
    queryFn: async () => {
      const res = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message?.message ||
            errorData.message ||
            "Failed to fetch profile",
        );
      }

      const data = await res.json();

      // Убираем добавление ?t=timestamp на фронтенде, так как теперь бэкенд
      // генерирует абсолютно уникальные имена файлов (с timestamp внутри имени).
      // Это решает проблему кэширования браузера на 100% и не ломает подпись MinIO.

      return data;
    },
    enabled: !!token, // Запрос не выполнится, пока нет токена
  });
};

// Хук для обновления профиля (PATCH)
export const useUpdateProfile = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: Partial<UserProfile>) => {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message?.message || errorData.message || "Update failed",
        );
      }

      return res.json();
    },
    onSuccess: () => {
      // При успешном обновлении говорим React Query, что кэш ['profile'] устарел.
      // Он автоматически сделает новый GET-запрос и обновит UI во всех компонентах!
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Хук для загрузки аватарки (POST)
export const useUploadAvatar = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/users/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message?.message || errorData.message || "Upload failed",
        );
      }

      return res.json();
    },
    onSuccess: () => {
      // Инвалидируем кэш профиля, чтобы получить новые ссылки на аватарку
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
