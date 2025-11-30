import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// 检查登录状态
export const checkLoginStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      // 设置默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { isLoggedIn: true, user };
    }
    
    return { isLoggedIn: false, user: null };
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return { isLoggedIn: false, user: null };
  }
};

// 退出登录
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    return true;
  } catch (error) {
    console.error('退出登录失败:', error);
    return false;
  }
};

// 更新用户信息
export const updateStoredUser = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return false;
  }
};