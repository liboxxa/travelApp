const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^1[3-9]\d{9}$/  // 中国手机号格式
  },
  nickname: {
    type: String,
    default: function() {
      return '用户' + Math.random().toString(36).substring(2, 8);
    }
  },
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now()
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown'
  },
  signature: {
    type: String,
    default: '这个人很懒，什么都没留下~'
  },
  preferences: [{
    type: String  // 旅行偏好：['自然景观', '美食之旅']
  }],
  // 统计信息
  stats: {
    publishedCount: { type: Number, default: 0 },
    collectedCount: { type: Number, default: 0 },
    extractCount: { type: Number, default: 0 }
  },
  // 收藏的路线
  collections: [{
    routeId: String,
    collectedAt: { type: Date, default: Date.now }
  }],
  // 会员信息（可选）
  membership: {
    type: { type: String, enum: ['free', 'vip'], default: 'free' },
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
});

// 创建索引
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;