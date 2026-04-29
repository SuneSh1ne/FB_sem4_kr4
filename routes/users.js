const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users - Создание нового пользователя
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body;
    
    const user = await User.create({
      first_name,
      last_name,
      age,
    });
    
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ 
      error: 'Ошибка при создании пользователя',
      details: error.message 
    });
  }
});

// GET /api/users - Получение списка всех пользователей
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['created_at', 'DESC']],
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при получении пользователей',
      details: error.message 
    });
  }
});

// GET /api/users/:id - Получение конкретного пользователя
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при получении пользователя',
      details: error.message 
    });
  }
});

// PATCH /api/users/:id - Обновление информации пользователя
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const { first_name, last_name, age } = req.body;
    
    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      age: age || user.age,
    });
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ 
      error: 'Ошибка при обновлении пользователя',
      details: error.message 
    });
  }
});

// DELETE /api/users/:id - Удаление пользователя
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    await user.destroy();
    
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при удалении пользователя',
      details: error.message 
    });
  }
});

module.exports = router;