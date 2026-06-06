import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { ImageItem } from '../components/ImageCard';

interface GetImagesResponse {
  node: ImageItem[];
  pageInfo: {
    pageNo: number;
    perPage: number;
    totalCount: number;
    totalPageCount: number;
  };
}

// 1. Хук для получения картинок пользователя (с пагинацией и поиском)
export const useUserImages = (pageNo: number, perPage: number, search: string = '') => {
  const { token } = useAuth();

  return useQuery<GetImagesResponse, Error>({
    // Кэшируем каждую страницу и каждый поисковый запрос отдельно
    queryKey: ['userImages', pageNo, perPage, search], 
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        pageNo: pageNo.toString(),
        perPage: perPage.toString(),
      });
      if (search) queryParams.append('search', search);

      const res = await fetch(`/api/store/image?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch images');
      return res.json();
    },
    enabled: !!token,
  });
};

// 2. Хук для бесконечного скролла ленты (с поиском)
export const useFeedImages = (perPage: number, search: string = '') => {
  return useInfiniteQuery<GetImagesResponse, Error>({
    // Кэшируем каждый поисковый запрос отдельно
    queryKey: ['feedImages', perPage, search],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams({
        pageNo: (pageParam as number).toString(),
        perPage: perPage.toString(),
      });
      if (search) queryParams.append('search', search);

      const res = await fetch(`/api/store/feed?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch feed');
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageInfo.pageNo < lastPage.pageInfo.totalPageCount) {
        return lastPage.pageInfo.pageNo + 1;
      }
      return undefined;
    },
  });
};

// 3. Мутация для загрузки картинки
export const useUploadImage = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/store/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message?.message || errorData.message || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userImages'] });
    },
  });
};

// 4. Мутация для удаления картинки
export const useDeleteImage = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/store/image', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userImages'] });
      queryClient.invalidateQueries({ queryKey: ['feedImages'] });
    },
  });
};

// 5. Мутация для редактирования картинки
export const useUpdateImage = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; title: string; author: string }) => {
      const res = await fetch('/api/store/update', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message?.message || errorData.message || 'Update failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userImages'] });
      queryClient.invalidateQueries({ queryKey: ['feedImages'] });
    },
  });
};

// 6. Мутация для публикации/снятия с публикации
export const usePublishImage = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/store/publish', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message?.message || errorData.message || 'Publish failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userImages'] });
      queryClient.invalidateQueries({ queryKey: ['feedImages'] });
    },
  });
};
