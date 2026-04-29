const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'Имя обязательно для заполнения'],
    trim: true,
    minlength: [2, 'Имя должно содержать минимум 2 символа'],
    maxlength: [50, 'Имя не должно превышать 50 символов']
  },
  last_name: {
    type: String,
    required: [true, 'Фамилия обязательна для заполнения'],
    trim: true,
    minlength: [2, 'Фамилия должна содержать минимум 2 символа'],
    maxlength: [50, 'Фамилия не должна превышать 50 символов']
  },
  age: {
    type: Number,
    required: [true, 'Возраст обязателен для заполнения'],
    min: [0, 'Возраст не может быть отрицательным'],
    max: [150, 'Некорректный возраст']
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Индексы для оптимизации поиска
userSchema.index({ first_name: 1, last_name: 1 });
userSchema.index({ age: 1 });

// Виртуальное поле full_name
userSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Настройка JSON-вывода
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;