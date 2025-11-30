import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Text
} from 'react-native';
import { Card, Chip, ActivityIndicator, Button,IconButton } from 'react-native-paper'; // 移除 IconButton，添加 Button
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, ENDPOINTS } from '../config/api';
import SkeletonCard from '../components/SkeletonCard';


export default function MyRoutesScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
    const unsubscribe = navigation.addListener('focus', () => {
      loadRoutes();
    });
    return unsubscribe;
  }, [navigation]);

    const loadRoutes = async () => {
  try {
    const url = `${API_BASE_URL}${ENDPOINTS.MY_ROUTES}`;
    console.log('正在请求(fetch):', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    
    if (json.success) {
      setRoutes(json.data);
    } else {
      console.log('后端返回错误:', json.message);
    }
  } catch (error) {
    console.error('获取路线失败(fetch):', error);
    Alert.alert('错误', '网络请求失败: ' + error.message);
  } finally {
    setLoading(false);
  }
};
    // 删除逻辑
  const handleDelete = (routeId) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条攻略吗？无法恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ 修改这里：改为 DELETE 请求，拼上 routeId
              // 注意：这里需要手动拼写 API 路径，因为配置里可能只有基础路径
              const response = await axios.delete(`${API_BASE_URL}/api/routes/${routeId}`, {
                headers: { Authorization: `Bearer ${userToken}` }
              });
              
              if (response.data.success) {
                // 界面上移除
                setRoutes(prevRoutes => prevRoutes.filter(item => item._id !== routeId));
                Alert.alert('成功', '删除成功');
              }
            } catch (error) {
              console.error('删除失败:', error);
              Alert.alert('失败', '删除失败，请重试');
            }
          }
        }
      ]
    );
  };
  // 点击查看详情
  const handleItemPress = (item) => {
    // 转换为 ExtractResultScreen 需要的数据格式
    const travelPlan = {
      destination: item.destination,
      duration: item.days,
      budget: item.budget + '元',
      summary: item.content,
      // 构造一个简单的行程结构用于展示
      dailyPlan: [
        {
          day: 1,
          theme: '行程安排',
          activities: [
            {
              time: '全天',
              place: item.destination,
              description: item.content
            }
          ]
        }
      ],
      // 其它字段
      tags: item.tags,
      isPublic: item.isPublic
    };

    navigation.navigate('ExtractResult', {
      travelPlan: travelPlan
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.8}>
      <Card style={styles.card}>
        {/* ✅ 新增：如果有图片，显示第一张作为封面 */}
      {item.images && item.images.length > 0 && (
        <Card.Cover 
          source={{ uri: item.images[0] }} 
          style={styles.cardCover} 
        />
      )}

        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            
            <View style={styles.headerRight}>
              {/* 状态标签 */}
              <View style={[
                styles.statusTag, 
                item.isPublic ? styles.publicTag : styles.privateTag
              ]}>
                <Text style={[
                  styles.statusText,
                  item.isPublic ? styles.publicText : styles.privateText
                ]}>
                  {item.isPublic ? '已发布' : '私密'}
                </Text>
              </View>
              
              {/* 删除按钮 */}
              <IconButton 
                icon="delete-outline" 
                size={20} 
                iconColor="#999"
                onPress={() => handleDelete(item._id)}
                style={styles.deleteBtn}
              />
            </View>
          </View>
          
          {/* ... 中间内容不变 ... */}
          <Text style={styles.destination}>📍 {item.destination} · {item.days} · {item.budget}元</Text>
          <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
          
          <View style={styles.footer}>
            {/* ... 底部内容不变 ... */}
            <View style={styles.tags}>
              {item.tags && item.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>#{tag} </Text>
              ))}
            </View>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  if (loading) {
  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    </View>
  );
}

  if (routes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>还没有发布过攻略</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('发布')}
          style={styles.goButton}
        >
          去发布
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardCover: {
    height: 150,
    marginBottom: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  // 自定义标签样式，替代 Chip
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  publicTag: {
    backgroundColor: '#E8F5E9',
  },
  privateTag: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
  },
  publicText: {
    color: '#4CAF50',
  },
  privateText: {
    color: '#FF9800',
  },
  destination: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  tags: {
    flexDirection: 'row',
  },
  tag: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  goButton: {
    backgroundColor: '#FF6B6B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    margin: 0,
    marginRight: -10, // 稍微往右靠一点
  },
});