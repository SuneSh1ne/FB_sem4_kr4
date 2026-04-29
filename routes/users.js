const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users - Создание нового пользователя
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body;
    
    // Проверка обязательных полей
    if (!first_name || !last_name || age === undefined) {
      return res.status(400).json({ 
        error: 'Все поля обязательны: first_name, last_name, age' 
      });
    }

    const user = new User({
      first_name,
      last_name,
      age
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    // Обработка ошибок валидации
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: 'Ошибка валидации', details: errors });
    }
    res.status(400).json({ error: 'Ошибка при создании пользователя', details: err.message });
  }
});

// GET /api/users - Получение списка пользователей
router.get('/', async (req, res) => {
  try {
    // Поддержка фильтрации по возрасту
    const filter = {};
    
    if (req.query.minAge) {
      filter.age = { ...filter.age, $gte: parseInt(req.query.minAge) };
    }
    if (req.query.maxAge) {
      filter.age = { ...filter.age, $lte: parseInt(req.query.maxAge) };
    }

    // Поддержка пагинации
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Поддержка сортировки
    const sortField = req.query.sortBy || 'created_at';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const users = await User.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении пользователей', details: err.message });
  }
});

// GET /api/users/:id - Получение конкретного пользователя
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Некорректный ID пользователя' });
    }
    res.status(500).json({ error: 'Ошибка при получении пользователя', details: err.message });
  }
});

// PATCH /api/users/:id - Обновление информации пользователя
router.patch('/:id', async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body;
    
    // Проверка, что хотя бы одно поле для обновления предоставлено
    if (!first_name && !last_name && age === undefined) {
      return res.status(400).json({ 
        error: 'Необходимо указать хотя бы одно поле для обновления: first_name, last_name, age' 
      });
    }

    // Формируем объект с обновляемыми полями
    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (age !== undefined) updateData.age = age;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true,      // Возвращает обновленный документ
        runValidators: true  // Запускает валидацию
      }
    );

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: 'Ошибка валидации', details: errors });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Некорректный ID пользователя' });
    }
    res.status(400).json({ error: 'Ошибка при обновлении пользователя', details: err.message });
  }
});

// DELETE /api/users/:id - Удаление пользователя
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ 
      message: 'Пользователь успешно удален',
      deletedUser: user 
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Некорректный ID пользователя' });
    }
    res.status(500).json({ error: 'Ошибка при удалении пользователя', details: err.message });
  }
});

// Дополнительный маршрут - статистика по пользователям
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          averageAge: { $avg: '$age' },
          minAge: { $min: '$age' },
          maxAge: { $max: '$age' }
        }
      }
    ]);

    res.json(stats[0] || { totalUsers: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении статистики', details: err.message });
  }
});

module.exports = router;