# Gallery Project (Monorepo)

Проект содержит бэкенд и два фронтенда.

## GitHub Actions (CI)

В проекте настроены автоматические проверки:
- **Admin Frontend CI**: запускается при изменениях в папке `admin-frontend`.
- **User Frontend CI**: запускается при изменениях в папке `user-frontend`.

Каждый раз, когда вы делаете `push`, GitHub проверит:
1. Устанавливаются ли зависимости (`npm ci`).
2. Нет ли ошибок в стиле кода (`npm run lint`).
3. Собирается ли проект без ошибок (`npm run build`).

Статус проверок можно увидеть во вкладке **Actions** вашего репозитория.

## Структура
- `/` - Бэкенд (NestJS)
- `/admin-frontend` - Панель администратора (Vite + React)
- `/user-frontend` - Пользовательская галерея (Next.js)

## Запуск
1. Настройте `.env` файлы.
2. `make build-backend-image`
3. `make up`