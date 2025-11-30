import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Text
} from 'react-native';
import { Card, Button, IconButton, Searchbar } from 'react-native-paper';
import { getCollectionsByDestination } from '../utils/storage';

export default function CollectionsScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCollections();
    
    // 监听页面聚焦，重新加载数据
    const unsubscribe = navigation.addListener('focus', () => {
      loadCollections();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadCollections = async () => {
    setLoading(true);
    const data = await getCollectionsByDestination();
    setCollections(data);
    setLoading(false);
  };

  const filteredCollections = collections.filter(item =>
    item.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDestinationPress = (destination, items) => {
    navigation.navigate('CollectionDetail', { destination, items });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleDestinationPress(item.destination, item.items)}
      activeOpacity={0.8}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.leftContent}>
            <Text style={styles.icon}>📍</Text>
            <View style={styles.textContent}>
              <Text style={styles.destination}>{item.destination}</Text>
              <Text style={styles.count}>{item.count} 条攻略</Text>
            </View>
          </View>
          <IconButton icon="chevron-right" size={24} />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>加载中...</Text>
      </View>
    );
  }

  if (collections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyText}>还没有收藏任何攻略</Text>
        <Text style={styles.emptyHint}>去首页发现精彩旅程吧！</Text>
        <Button 
          mode="contained" 
          // 修改这里：跳转到 'HomeMain' 而不是 '首页'
          onPress={() => navigation.navigate('HomeMain')}
          style={styles.goButton}
        >
          去发现
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="搜索目的地"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <FlatList
        data={filteredCollections}
        renderItem={renderItem}
        keyExtractor={(item) => item.destination}
        contentContainerStyle={styles.listContent}
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
    padding: 20,
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    elevation: 0,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  destination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  count: {
    fontSize: 13,
    color: '#999',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  goButton: {
    backgroundColor: '#FF6B6B',
  },
});