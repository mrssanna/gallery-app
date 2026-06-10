# Gallery Project (Monorepo)

![Backend CI](https://github.com/mrssanna/gallery-app/actions/workflows/backend.yml/badge.svg)
![Admin Frontend CI](https://github.com/mrssanna/gallery-app/actions/workflows/admin-frontend.yml/badge.svg)
![User Frontend CI](https://github.com/mrssanna/gallery-app/actions/workflows/user-frontend.yml/badge.svg)
![Deploy All Frontends](https://github.com/mrssanna/gallery-app/actions/workflows/deploy-all.yml/badge.svg)

**Live Demo (User Frontend):** [https://mrssanna.github.io/gallery-app/](https://mrssanna.github.io/gallery-app/)
**Live Demo (Admin Panel):** [https://mrssanna.github.io/gallery-app/admin/](https://mrssanna.github.io/gallery-app/admin/)

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

## GitHub Actions (CI/CD)

Проверки линтера, тестов и сборки настроены для всех частей проекта. Статус проверок отображается бейджами выше.

- **Backend CI**: запускается при изменениях в корневой папке (код сервера и тесты).
- **Admin Frontend CI**: запускается при изменениях в папке `admin-frontend`.
- **User Frontend CI**: запускается при изменениях в папке `user-frontend`.
- **Deploy User Frontend**: Автоматический деплой пользовательского фронтенда на GitHub Pages.

## Важное примечание по деплою

Каждый раз, когда вы делаете `push`, GitHub проверит:
1. Устанавливаются ли зависимости (`npm ci`).
2. Нет ли ошибок в стиле кода (`npm run lint`).
3. Собирается ли проект без ошибок (`npm run build`).
4. **Проходят ли автоматические тесты (только для бэкенда, `npm run test`).**

Статус проверок можно увидеть во вкладке **Actions** вашего репозитория.

## Важное примечание по деплою

Поскольку GitHub Pages поддерживает только статику, фронтенды настроены на использование моковых данных в демо-режиме.
Запросы к `/api` не будут работать без задеплоенного бэкенда.

## Команды для подготовки проекта

После обновления зависимостей или при первом запуске выполните:
```bash
make setup-all      # Установка зависимостей для всех фронтендов
```

## Качество кода

- `make format-all` — отформатировать весь код (Prettier)
- `make lint-all` — проверить весь код на ошибки (ESLint/Next Lint)

## Список всех доступных команд с описанием

```bash
make help
```

## Структура
- `/` - Бэкенд (NestJS)
- `/admin-frontend` - Панель администратора (Vite + React)
- `/user-frontend` - Пользовательская галерея (Next.js)

## Запуск
1. Настройте `.env` файлы.
2. `make build-backend-image`
3. `make up`