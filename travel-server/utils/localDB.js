const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ROUTES_FILE = path.join(DATA_DIR, 'routes.json');

// 确保路线文件存在
if (!fs.existsSync(ROUTES_FILE)) {
  fs.writeFileSync(ROUTES_FILE, JSON.stringify([], null, 2));
}

// 读取所有路线
function getRoutes() {
  try {
    return JSON.parse(fs.readFileSync(ROUTES_FILE, 'utf8'));
  } catch (error) {
    return [];
  }
}

// 保存路线
function saveRoutes(routes) {
  fs.writeFileSync(ROUTES_FILE, JSON.stringify(routes, null, 2));
}

// 创建路线
function createRoute(routeData) {
  const routes = getRoutes();
  const newRoute = {
    _id: 'route_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    ...routeData,
    likes: 0,
    views: 0,
    createdAt: new Date().toISOString()
  };
  
  routes.unshift(newRoute); // 新发布的排前面
  saveRoutes(routes);
  return newRoute;
}

// 获取用户发布的路线
function getUserRoutes(userId) {
  const routes = getRoutes();
  return routes.filter(r => r.userId === userId);
}

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 确保用户文件存在
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// 读取所有用户
function getUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 保存所有用户
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 根据手机号查找用户
function findUserByPhone(phone) {
  const users = getUsers();
  return users.find(u => u.phone === phone);
}

// 根据ID查找用户
function findUserById(id) {
  const users = getUsers();
  return users.find(u => u._id === id);
}

// 创建新用户
function createUser(userData) {
  const users = getUsers();
  const newUser = {
    _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    phone: userData.phone,
    nickname: userData.nickname || '旅行者' + userData.phone.slice(-4),
    avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.phone}`,
    gender: 'unknown',
    signature: '这个人很懒，什么都没留下~',
    preferences: [],
    stats: {
      publishedCount: 0,
      collectedCount: 0,
      extractCount: 0
    },
    collections: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
}
// 删除路线
function deleteRoute(routeId, userId) {
  let routes = getRoutes();
  const initialLength = routes.length;
  
  // 过滤掉要删除的路线
  // 注意：_id 是字符串，userId 也是字符串，可以直接比较
  const newRoutes = routes.filter(r => !(r._id === routeId && r.userId === userId));
  
  if (newRoutes.length < initialLength) {
    saveRoutes(newRoutes);
    return true; // 删除成功
  }
  return false; // 没找到
}

// 更新用户
function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex(u => u._id === id);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    return users[index];
  }
  
  return null;
}

// 更新最后登录时间
function updateLastLogin(id) {
  return updateUser(id, { lastLoginAt: new Date().toISOString() });
}

module.exports = {
  findUserByPhone,
  findUserById,    // <--- 必须有这个
  createUser,
  updateUser,
  updateLastLogin,
  getRoutes,
  createRoute,
  getUserRoutes,
  deleteRoute, // 新增导出
};