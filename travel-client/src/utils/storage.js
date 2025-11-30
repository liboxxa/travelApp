import AsyncStorage from '@react-native-async-storage/async-storage';

const COLLECTIONS_KEY = 'travel_collections';
const HISTORY_KEY = 'travel_history';

// =================== 收藏功能 ===================

/**
 * 收藏攻略
 */
export async function addToCollection(travelPlan, originalLink = '') {
  try {
    const collections = await getCollections();
    
    // 检查是否已收藏
    const exists = collections.find(item => 
      item.travelPlan.destination === travelPlan.destination &&
      item.travelPlan.duration === travelPlan.duration
    );
    
    if (exists) {
      return { success: false, message: '已经收藏过了' };
    }
    
    const newItem = {
      id: Date.now().toString(),
      travelPlan: travelPlan,
      originalLink: originalLink,
      collectedAt: new Date().toISOString()
    };
    
    collections.unshift(newItem);
    await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    
    return { success: true, message: '收藏成功' };
  } catch (error) {
    console.error('收藏失败:', error);
    return { success: false, message: '收藏失败' };
  }
}

/**
 * 取消收藏
 */
export async function removeFromCollection(id) {
  try {
    const collections = await getCollections();
    const filtered = collections.filter(item => item.id !== id);
    await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('取消收藏失败:', error);
    return { success: false };
  }
}

/**
 * 获取所有收藏
 */
export async function getCollections() {
  try {
    const data = await AsyncStorage.getItem(COLLECTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('获取收藏失败:', error);
    return [];
  }
}

/**
 * 获取按目的地分组的收藏
 */
export async function getCollectionsByDestination() {
  try {
    const collections = await getCollections();
    
    // 按目的地分组
    const grouped = {};
    collections.forEach(item => {
      const destination = item.travelPlan.destination || '未知';
      if (!grouped[destination]) {
        grouped[destination] = [];
      }
      grouped[destination].push(item);
    });
    
    // 转换为数组格式
    return Object.keys(grouped).map(destination => ({
      destination: destination,
      count: grouped[destination].length,
      items: grouped[destination]
    }));
  } catch (error) {
    console.error('获取分组收藏失败:', error);
    return [];
  }
}

/**
 * 检查是否已收藏
 */
export async function isCollected(destination, duration) {
  try {
    const collections = await getCollections();
    return collections.some(item => 
      item.travelPlan.destination === destination &&
      item.travelPlan.duration === duration
    );
  } catch (error) {
    return false;
  }
}

// =================== 历史记录功能 ===================

/**
 * 添加到历史记录
 */
export async function addToHistory(travelPlan, originalLink = '') {
  try {
    const history = await getHistory();
    
    const newItem = {
      id: Date.now().toString(),
      travelPlan: travelPlan,
      originalLink: originalLink,
      viewedAt: new Date().toISOString()
    };
    
    // 移除重复项（相同目的地和天数）
    const filtered = history.filter(item =>
      !(item.travelPlan.destination === travelPlan.destination &&
        item.travelPlan.duration === travelPlan.duration)
    );
    
    filtered.unshift(newItem);
    
    // 最多保存50条历史
    if (filtered.length > 50) {
      filtered.pop();
    }
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('保存历史失败:', error);
    return { success: false };
  }
}

/**
 * 获取历史记录
 */
export async function getHistory() {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('获取历史失败:', error);
    return [];
  }
}

/**
 * 清空历史记录
 */
export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    return { success: true };
  } catch (error) {
    console.error('清空历史失败:', error);
    return { success: false };
  }
}