FROM node:22-bookworm-slim

WORKDIR /app

# Отключаем сбор телеметрии Next.js (ускоряет запуск и предотвращает зависания)
ENV NEXT_TELEMETRY_DISABLED 1

# Копируем только файлы зависимостей
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код
COPY . .

# Запускаем сервер разработки
CMD ["npm", "run", "dev"]
