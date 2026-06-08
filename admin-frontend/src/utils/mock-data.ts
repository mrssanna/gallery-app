export const MOCK_ADMIN_PROFILE = {
  id: "admin-1",
  login: "admin@mail.ru",
  role: "admin",
  firstName: "Анна",
  lastName: "Админ",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_USERS = [
  {
    id: "user-1",
    login: "user1@mail.ru",
    role: "user",
    isBlocked: false,
    firstName: "Иван",
    lastName: "Иванов",
    avatarUrl: "https://i.pravatar.cc/150?u=1",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-05T12:00:00Z",
  },
  {
    id: "user-2",
    login: "user2@mail.ru",
    role: "user",
    isBlocked: true,
    firstName: "Мария",
    lastName: "Петрова",
    avatarUrl: "https://i.pravatar.cc/150?u=2",
    createdAt: "2025-02-10T15:30:00Z",
    updatedAt: "2025-02-11T09:00:00Z",
  },
  {
    id: "admin-1",
    login: "admin@mail.ru",
    role: "admin",
    isBlocked: false,
    firstName: "Анна",
    lastName: "Админ",
    createdAt: "2024-12-01T08:00:00Z",
    updatedAt: "2025-03-01T10:00:00Z",
  },
];

export const MOCK_USER_IMAGES = [
  {
    id: "img-1",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200",
    title: "Горы",
    author: "Иван Иванов",
    format: "image/jpeg",
    size: 1024000,
    createdAt: "2025-01-02T10:00:00Z",
    updatedAt: "2025-01-02T10:00:00Z",
    publishedAt: "2025-01-02T11:00:00Z",
  },
  {
    id: "img-2",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200",
    title: "Море",
    author: "Иван Иванов",
    format: "image/jpeg",
    size: 2048000,
    createdAt: "2025-01-03T15:00:00Z",
    updatedAt: "2025-01-03T15:00:00Z",
    publishedAt: null,
  },
];
