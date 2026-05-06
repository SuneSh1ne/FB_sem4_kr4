FROM node:18-alpine

WORKDIR /app

# Установка curl для health checks
RUN apk add --no-cache curl

# Копирование файлов
COPY package.json .
COPY server.js .

# Установка зависимостей
RUN npm install --production

EXPOSE 3000

CMD ["node", "server.js"]