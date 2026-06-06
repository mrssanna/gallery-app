# Gallery Project (Monorepo)

Проект содержит бэкенд и два фронтенда.

![Admin Frontend CI](https://github.com/mrssanna/gallery-app/actions/workflows/admin-frontend.yml/badge.svg)
![User Frontend CI](https://github.com/mrssanna/gallery-app/actions/workflows/user-frontend.yml/badge.svg)

## ⚠️ ВНИМАНИЕ: Работа с Git

В проекте настроено два удаленных репозитория:
1.  **origin** — ВАШ репозиторий (Бэкенд + 2 Фронтенда). **Пушить сюда!**
2.  **upstream** — Оригинал Елены (Только бэкенд).

### Как не ошибиться с отправкой кода:

- **Сохранить всё у себя (рекомендуется):**
  ```bash
  git push origin main
  ```
- **Отправить только бэк Елене (если нужно):**
  ```bash
  git push upstream main
  ```

## GitHub Actions (CI)
Проверки линтера и сборки настроены для обоих фронтендов. Статус проверок отображается бейджами выше.

- **Admin Frontend CI**: запускается при изменениях в папке `admin-frontend`.
- **User Frontend CI**: запускается при изменениях в папке `user-frontend`.

Каждый раз, когда вы делаете `push`, GitHub проверит:
1. Устанавливаются ли зависимости (`npm ci`).
2. Нет ли ошибок в стиле кода (`npm run lint`).
3. Собирается ли проект без ошибок (`npm run build`).

Статус проверок можно увидеть во вкладке **Actions** вашего репозитория.

## Команды для подготовки проекта

После обновления зависимостей или при первом запуске выполните:
```bash
make setup-all      # Установка зависимостей для всех фронтендов
```

## Качество кода

- `make format-all` — отформатировать весь код (Prettier)
- `make lint-all` — проверить весь код на ошибки (ESLint/Next Lint)

## Структура
- `/` - Бэкенд (NestJS)
- `/admin-frontend` - Панель администратора (Vite + React)
- `/user-frontend` - Пользовательская галерея (Next.js)

## Запуск
1. Настройте `.env` файлы.
2. `make build-backend-image`
3. `make up`