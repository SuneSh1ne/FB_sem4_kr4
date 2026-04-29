const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Подключаем маршруты
app.use('/api/users', userRoutes);

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'API для управления пользователями',
    version: '1.0.0',
    endpoints: {
      createUser: 'POST /api/users',
      getUsers: 'GET /api/users',
      getUserById: 'GET /api/users/:id',
      updateUser: 'PATCH /api/users/:id',
      deleteUser: 'DELETE /api/users/:id',
      stats: 'GET /api/users/stats/overview'
    }
  });
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Маршрут не найден',
    availableEndpoints: '/api/users'
  });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Непредвиденная ошибка:', err);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Обратитесь к администратору'
  });
});

// Подключение к MongoDB и запуск сервера
const startServer = async () => {
  try {
    // Подключение к MongoDB (без устаревших опций)
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
    
    // В новых версиях Mongoose просто передаем URI
    await mongoose.connect(mongoURI);
    
    console.log('✓ Подключение к MongoDB установлено успешно');
    console.log(`✓ База данных: ${mongoose.connection.db.databaseName}`);
    
    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`✓ Сервер запущен на http://localhost:${PORT}`);
      console.log('\nДоступные эндпоинты:');
      console.log('  POST   /api/users           - Создание пользователя');
      console.log('  GET    /api/users           - Список пользователей');
      console.log('  GET    /api/users/:id       - Пользователь по ID');
      console.log('  PATCH  /api/users/:id       - Обновление пользователя');
      console.log('  DELETE /api/users/:id       - Удаление пользователя');
      console.log('  GET    /api/users/stats/overview - Статистика');
    });
  } catch (error) {
    console.error('✗ Ошибка при запуске сервера:', error.message);
    process.exit(1);
  }
};

// Обработка событий подключения к MongoDB
mongoose.connection.on('error', (err) => {
  console.error('Ошибка подключения к MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB отключена');
});

// Корректное завершение работы
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n✓ Подключение к MongoDB закрыто');
  process.exit(0);
});

startServer();