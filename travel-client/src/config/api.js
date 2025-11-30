// 1. 修改这里的 IP 为你电脑当前的 IP
// 可以在命令行输入 ipconfig (Windows) 或 ifconfig (Mac) 查看
const DEV_IP = '192.168.1.31'; 
const PORT = '5000';

// 基础 URL
export const API_BASE_URL = 'https://travel-app-pi-ruddy.vercel.app';

// 接口路径常量
export const ENDPOINTS = {
  LOGIN: '/api/auth/login',
  SEND_CODE: '/api/auth/send-code',
  PUBLISH: '/api/routes/publish',
  MY_ROUTES: '/api/routes/my-published',
  DOUYIN_EXTRACT: '/api/douyin/extract',
};