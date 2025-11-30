import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Text
} from 'react-native';
import { Card, IconButton, Button } from 'react-native-paper';
import { getHistory, clearHistory } from '../utils/storage';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
    
    // 每次进入页面都刷新
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleClear = () => {
    if (history.length === 0) return;

    Alert.alert(
      '清空历史',
      '确定要清空所有浏览记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          }
        }
      ]
    );
  };

  const handleItemPress = (item) => {
    navigation.navigate('ExtractResult', {
      travelPlan: item.travelPlan,
      originalLink: item.originalLink
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    // 如果是今天，显示时间
    if (date.toDateString() === now.toDateString()) {
      return `今天 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    // 否则显示日期
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.8}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.leftContent}>
            <Text style={styles.destination}>{item.travelPlan.destination}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>{item.travelPlan.duration}</Text>
              <Text style={styles.separator}>|</Text>
              <Text style={styles.infoText}>{item.travelPlan.budget}</Text>
            </View>
          </View>
          <View style={styles.rightContent}>
            <Text style={styles.timeText}>{formatDate(item.viewedAt)}</Text>
            <IconButton icon="chevron-right" size={20} iconColor="#ccc" />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>浏览足迹</Text>
        <TouchableOpacity onPress={handleClear} disabled={history.length === 0}>
          <Text style={[styles.clearBtn, history.length === 0 && styles.disabledBtn]}>
            清空
          </Text>
        </TouchableOpacity>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🕒</Text>
          <Text style={styles.emptyText}>暂无浏览记录</Text>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('HomeMain')}
            style={styles.goButton}
            textColor="#FF6B6B"
          >
            去逛逛
          </Button>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearBtn: {
    fontSize: 14,
    color: '#666',
  },
  disabledBtn: {
    color: '#ccc',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leftContent: {
    flex: 1,
  },
  destination: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  separator: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 6,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginRight: -8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  goButton: {
    borderColor: '#FF6B6B',
  },
});