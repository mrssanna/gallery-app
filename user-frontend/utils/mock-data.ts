export const MOCK_USER = {
  id: "mock-id-123",
  login: "demo@example.com",
  firstName: "Демо",
  lastName: "Пользователь",
  gender: "мужской",
  role: "user",
  avatarUrl: "https://i.pravatar.cc/150?u=demo",
};

export const MOCK_IMAGES = {
  node: [
    {
      id: "1",
      title: "Горный пейзаж",
      author: "Анна С.",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80",
      format: "image/jpeg",
      size: 1024000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Морской берег",
      author: "Иван И.",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
      format: "image/jpeg",
      size: 2048000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Лесная тропа",
      author: "Демо Аккаунт",
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80",
      format: "image/jpeg",
      size: 1500000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    },
  ],
  pageInfo: {
    pageNo: 1,
    perPage: 12,
    totalCount: 3,
    totalPageCount: 1,
  },
};
