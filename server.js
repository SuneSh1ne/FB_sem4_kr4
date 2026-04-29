const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/users');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Подключаем маршруты
app.use('/api/users', userRoutes);

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Синхронизация с БД и запуск сервера
const start = async () => {
  try {
    // Проверка подключения к БД
    await sequelize.authenticate();
    console.log('Подключение к PostgreSQL установлено успешно.');
    
    // Синхронизация моделей с БД (создание таблиц)
    await sequelize.sync({ force: false }); // force: true пересоздаст таблицы
    console.log('Модели синхронизированы с базой данных.');
    
    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

start();