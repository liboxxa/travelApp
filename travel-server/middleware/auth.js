const jwt = require('jsonwebtoken');

// 生成Token
function generateToken(userId) {
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '30d' }  // 30天过期
  );
}

// 验证Token中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未登录或登录已过期'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '登录已过期，请重新登录'
      });
    }
    
    req.userId = decoded.userId;
    next();
  });
}

// 可选的认证（登录了更好，没登录也行）
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key', (err, decoded) => {
      if (!err) {
        req.userId = decoded.userId;
      }
    });
  }
  
  next();
}

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth
};