// 验证码管理（开发环境用内存存储，生产环境应该用Redis）
const verificationCodes = new Map();

// 生成验证码
function generateCode() {
  // 生产环境应该生成真随机数
  // 开发环境为了方便，可以用固定的123456
  if (process.env.NODE_ENV === 'development') {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码（模拟）
async function sendSMSCode(phone) {
  const code = generateCode();
  
  // 存储验证码，5分钟过期
  verificationCodes.set(phone, {
    code: code,
    expiresAt: Date.now() + 5 * 60 * 1000,  // 5分钟
    attempts: 0  // 尝试次数
  });

  console.log(`📱 验证码已发送到 ${phone}: ${code}`);
  
  // 在实际项目中，这里应该调用短信服务API
  // 例如：阿里云短信、腾讯云短信等
  
  return true;
}

// 验证验证码
function verifySMSCode(phone, code) {
  const record = verificationCodes.get(phone);
  
  if (!record) {
    return { success: false, message: '验证码不存在或已过期' };
  }
  
  // 检查是否过期
  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(phone);
    return { success: false, message: '验证码已过期' };
  }
  
  // 检查尝试次数
  if (record.attempts >= 3) {
    verificationCodes.delete(phone);
    return { success: false, message: '验证码错误次数过多，请重新获取' };
  }
  
  // 验证码错误
  if (record.code !== code) {
    record.attempts++;
    return { success: false, message: '验证码错误' };
  }
  
  // 验证成功，删除验证码
  verificationCodes.delete(phone);
  return { success: true };
}

// 清理过期的验证码（定期执行）
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of verificationCodes.entries()) {
    if (now > record.expiresAt) {
      verificationCodes.delete(phone);
    }
  }
}, 60 * 1000);  // 每分钟清理一次

module.exports = {
  sendSMSCode,
  verifySMSCode
};