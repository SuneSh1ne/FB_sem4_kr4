# Используем легковесный образ Node.js на Alpine Linux
FROM node:18-alpine

# Установка curl для health checks (опционально)
RUN apk add --no-cache curl

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
# Это позволяет Docker кэшировать слой с npm install
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем исходный код приложения
COPY . .

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Переключаемся на непривилегированного пользователя
USER nodejs

# Документируем порт
EXPOSE 3000

# Метаданные образа
LABEL maintainer="student@example.com"
LABEL version="1.0.0"
LABEL description="Backend server for load balancing"

# Команда запуска
CMD ["node", "server.js"]