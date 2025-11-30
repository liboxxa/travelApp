import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Text
} from 'react-native';
import { Card, IconButton, Chip } from 'react-native-paper';
import { removeFromCollection } from '../utils/storage';

export default function CollectionDetailScreen({ route, navigation }) {
  const { destination, items: initialItems } = route.params;
  const [items, setItems] = React.useState(initialItems);

  const handleView = (item) => {
    navigation.navigate('ExtractResult', {
      travelPlan: item.travelPlan,
      originalLink: item.originalLink
    });
  };

  const handleDelete = (item) => {
    Alert.alert(
      '取消收藏',
      '确定要取消收藏这条攻略吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            const result = await removeFromCollection(item.id);
            if (result.success) {
              const newItems = items.filter(i => i.id !== item.id);
              setItems(newItems);
              
              if (newItems.length === 0) {
                navigation.goBack();
              }
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleView(item)} activeOpacity={0.8}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>
                {item.travelPlan.destination}旅游攻略
              </Text>

              {/* 修改这里：使用Text代替Chip */}
              <View style={styles.infoRow}>
                {item.travelPlan.duration ? (
                  <View style={styles.infoTag}>
                    <Text style={styles.infoIcon}>⏱</Text>
                    <Text style={styles.infoText}>{item.travelPlan.duration}</Text>
                  </View>
                ) : null}
                {item.travelPlan.budget ? (
                  <View style={styles.infoTag}>
                    <Text style={styles.infoIcon}>💰</Text>
                    <Text style={styles.infoText}>{item.travelPlan.budget}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.date}>
                收藏于 {formatDate(item.collectedAt)}
              </Text>
            </View>
            <IconButton
              icon="delete-outline"
              size={24}
              iconColor="#FF6B6B"
              onPress={() => handleDelete(item)}
            />
          </View>
          {item.travelPlan.summary ? (
            <Text style={styles.summary} numberOfLines={2}>
              {item.travelPlan.summary}
            </Text>
          ) : null}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{destination}</Text>
        <Text style={styles.headerSubtitle}>共 {items.length} 条攻略</Text>
      </View>
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#E3F2FD',
    height: 24,
  },
  chipText: {
    fontSize: 11,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  summary: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
  },
});