const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // 关键配置：增加超时时间
      serverSelectionTimeoutMS: 5000, // 5秒超时
      socketTimeoutMS: 45000, // 45秒Socket超时
    });

    console.log(`✅ MongoDB 云数据库已连接: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB 连接失败: ${error.message}`);
    console.log('⚠️ 切换回本地文件存储模式');
    
    // 这里不退出进程，让系统降级运行
    // process.exit(1);
  }
};

module.exports = connectDB;