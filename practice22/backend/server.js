const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || 'unknown';
const SERVER_NAME = `backend-${SERVER_ID}`;

// Middleware для логирования
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
    pid: process.pid,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// GET /api/health - проверка здоровья
app.get('/api/health', (req, res) => {
  // Имитация случайных ошибок для тестирования отказоустойчивости
  // Раскомментируйте для проверки health checks:
  // if (Math.random() < 0.5) {
  //   return res.status(500).json({ 
  //     status: 'error', 
  //     server: SERVER_NAME,
  //     message: 'Симуляция ошибки сервера'
  //   });
  // }

  res.json({
    status: 'healthy',
    server: SERVER_NAME,
    port: PORT,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    },
    cpu: os.cpus().length + ' cores',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/users - список пользователей
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
    count: users.length,
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
    count: products.length,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/info - информация о сервере
app.get('/api/info', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const interfaces = {};

  Object.keys(networkInterfaces).forEach(name => {
    interfaces[name] = networkInterfaces[name].map(iface => ({
      address: iface.address,
      netmask: iface.netmask,
      family: iface.family,
      internal: iface.internal,
    }));
  });

  res.json({
    server: SERVER_NAME,
    port: PORT,
    platform: os.platform(),
    type: os.type(),
    release: os.release(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
    freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB',
    networkInterfaces: interfaces,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/load-test - имитация нагрузки
app.get('/api/load-test', (req, res) => {
  const startTime = Date.now();
  const iterations = parseInt(req.query.n) || 1000000;
  let sum = 0;

  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i);
  }

  const duration = Date.now() - startTime;

  res.json({
    server: SERVER_NAME,
    port: PORT,
    result: sum,
    iterations: iterations,
    duration: duration + 'ms',
    timestamp: new Date().toISOString(),
  });
});

// 404 обработчик
app.use((req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    server: SERVER_NAME,
    port: PORT,
  });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ ${SERVER_NAME} запущен на порту ${PORT}`);
  console.log(`  PID: ${process.pid}`);
  console.log(`  Hostname: ${os.hostname()}`);
  console.log(`  Доступен на http://0.0.0.0:${PORT}`);
});