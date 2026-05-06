const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_NAME = process.env.SERVER_NAME || `Server-${PORT}`;

// Middleware для логирования всех запросов
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${SERVER_NAME}`);
  next();
});

// Middleware для парсинга JSON
app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
  res.json({
    message: 'Ответ от backend-сервера',
    server: SERVER_NAME,
    port: PORT,
    hostname: os.hostname(),
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

// GET /api/users - список пользователей (имитация БД)
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' },
    { id: 2, name: 'Мария Петрова', email: 'maria@example.com' },
    { id: 3, name: 'Алексей Сидоров', email: 'alex@example.com' },
  ];

  res.json({
    source: SERVER_NAME,
    port: PORT,
    data: users,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/products - список товаров
app.get('/api/products', (req, res) => {
  const products = [
    { id: 1, name: 'Ноутбук', price: 75000 },
    { id: 2, name: 'Смартфон', price: 50000 },
    { id: 3, name: 'Планшет', price: 35000 },
  ];

  res.json({
    source: SERVER_NAME,
    port: PORT,
    data: products,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/health - эндпоинт для проверки здоровья
app.get('/api/health', (req, res) => {
  // Имитация случайных ошибок для тестирования отказоустойчивости
  // Раскомментируйте для проверки health checks:
  // if (Math.random() < 0.3) {
  //   return res.status(500).json({ status: 'error', server: SERVER_NAME });
  // }
  
  res.json({
    status: 'healthy',
    server: SERVER_NAME,
    port: PORT,
    uptime: process.uptime(),
    memory: process.memoryUsage().heapUsed / 1024 / 1024,
  });
});

// GET /api/info - информация о сервере
app.get('/api/info', (req, res) => {
  res.json({
    server: SERVER_NAME,
    port: PORT,
    platform: os.platform(),
    cpus: os.cpus().length,
    totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
    freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB',
    networkInterfaces: Object.keys(os.networkInterfaces()),
  });
});

// Имитация нагрузки (для тестирования)
app.get('/api/load-test', (req, res) => {
  const iterations = parseInt(req.query.n) || 1000000;
  let sum = 0;
  
  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i);
  }
  
  res.json({
    server: SERVER_NAME,
    port: PORT,
    result: sum,
    iterations: iterations,
    timestamp: new Date().toISOString(),
  });
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    server: SERVER_NAME,
    port: PORT,
  });
});

app.listen(PORT, () => {
  console.log(`✓ ${SERVER_NAME} запущен на порту ${PORT}`);
  console.log(`  PID: ${process.pid}`);
  console.log(`  http://localhost:${PORT}`);
});