import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Share,
  Alert,
  Text
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Divider,
  IconButton
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { addToCollection, isCollected, addToHistory } from '../utils/storage';

export default function ExtractResultScreen({ route, navigation }) {
  const { travelPlan, originalLink } = route.params || {};
  const [collected, setCollected] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkCollectionStatus();
    if (travelPlan) {
      addToHistory(travelPlan, originalLink);
    }
  }, []);

  const checkCollectionStatus = async () => {
    if (travelPlan) {
      const status = await isCollected(
        travelPlan.destination,
        travelPlan.duration
      );
      setCollected(status);
    }
  };

  if (!travelPlan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>未获取到数据</Text>
        <Button onPress={() => navigation.goBack()}>返回</Button>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      const shareText = formatPlanForShare(travelPlan);
      await Share.share({
        message: shareText,
        title: '旅游攻略',
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  const formatPlanForShare = (plan) => {
    let text = `📍 ${plan.destination || ''}旅游攻略\n\n`;
    text += `⏱ 行程: ${plan.duration || ''}\n`;
    text += `💰 预算: ${plan.budget || ''}\n\n`;
    text += `📝 概述: ${plan.summary || ''}\n\n`;
    return text;
  };

  const handleSave = async () => {
    if (saving) return;
    
    setSaving(true);
    
    if (collected) {
      Alert.alert('提示', '已在收藏夹中\n可在"我的收藏"中查看和管理');
    } else {
      const result = await addToCollection(travelPlan, originalLink);
      if (result.success) {
        setCollected(true);
        Alert.alert('成功', '已添加到收藏夹 ❤️');
      } else {
        Alert.alert('提示', result.message);
      }
    }
    
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={styles.destination}>
              {travelPlan.destination || '未知目的地'}
            </Text>
            <IconButton
              icon={collected ? "heart" : "heart-outline"}
              iconColor={collected ? "#FF6B6B" : "#666"}
              size={28}
              onPress={handleSave}
              disabled={saving}
            />
          </View>
          
          <View style={styles.chipRow}>
            {travelPlan.duration ? (
              <Chip icon="clock-outline" style={styles.chip}>
                {travelPlan.duration}
              </Chip>
            ) : null}
            {travelPlan.budget ? (
              <Chip icon="currency-cny" style={styles.chip}>
                {travelPlan.budget}
              </Chip>
            ) : null}
          </View>
          
          {travelPlan.summary ? (
            <Text style={styles.summary}>{travelPlan.summary}</Text>
          ) : null}
        </Card.Content>
      </Card>

      {travelPlan.dailyPlan && travelPlan.dailyPlan.length > 0 ? (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📅 详细行程</Text>
            {travelPlan.dailyPlan.map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <Text style={styles.dayTitle}>
                  Day {day.day || index + 1}
                  {day.theme ? ` - ${day.theme}` : ''}
                </Text>
                
                {day.activities && day.activities.length > 0 ? (
                  day.activities.map((activity, actIndex) => (
                    <View key={actIndex} style={styles.activityItem}>
                      {activity.time ? (
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      ) : null}
                      <View style={styles.activityContent}>
                        {activity.place ? (
                          <Text style={styles.activityPlace}>{activity.place}</Text>
                        ) : null}
                        {activity.description ? (
                          <Text style={styles.activityDesc}>{activity.description}</Text>
                        ) : null}
                        {activity.cost ? (
                          <Text style={styles.activityCost}>💰 {activity.cost}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))
                ) : null}
                
                {day.meals ? (
                  <View style={styles.mealsSection}>
                    <Text style={styles.mealsTitle}>🍽 餐饮推荐</Text>
                    {day.meals.breakfast ? (
                      <Text style={styles.mealText}>早餐: {day.meals.breakfast}</Text>
                    ) : null}
                    {day.meals.lunch ? (
                      <Text style={styles.mealText}>午餐: {day.meals.lunch}</Text>
                    ) : null}
                    {day.meals.dinner ? (
                      <Text style={styles.mealText}>晚餐: {day.meals.dinner}</Text>
                    ) : null}
                  </View>
                ) : null}
                
                <Divider style={styles.divider} />
              </View>
            ))}
          </Card.Content>
        </Card>
      ) : null}

      {travelPlan.transportation ? (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>🚗 交通指南</Text>
            {travelPlan.transportation.toDestination ? (
              <Text style={styles.infoText}>
                如何到达: {travelPlan.transportation.toDestination}
              </Text>
            ) : null}
            {travelPlan.transportation.local ? (
              <Text style={styles.infoText}>
                当地交通: {travelPlan.transportation.local}
              </Text>
            ) : null}
          </Card.Content>
        </Card>
      ) : null}

      {travelPlan.packingList && travelPlan.packingList.length > 0 ? (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>🎒 行李清单</Text>
            <View style={styles.chipContainer}>
              {travelPlan.packingList.map((item, index) => (
                <Chip key={index} style={styles.packingChip}>{item}</Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      ) : null}

      {travelPlan.tips && travelPlan.tips.length > 0 ? (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>💡 实用贴士</Text>
            {travelPlan.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <MaterialIcons name="star-outline" size={16} color="#4CAF50" />
                <Text style={styles.tipItemText}>{tip}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      ) : null}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="share-variant"
          onPress={handleShare}
          style={styles.shareButton}
        >
          分享攻略
        </Button>
        <Button
          mode="outlined"
          icon={collected ? "heart" : "heart-outline"}
          onPress={handleSave}
          style={styles.saveButton}
          loading={saving}
        >
          {collected ? '已收藏' : '收藏'}
        </Button>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destination: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#E3F2FD',
  },
  summary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dayContainer: {
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  activityTime: {
    width: 60,
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityPlace: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  activityCost: {
    fontSize: 12,
    color: '#4CAF50',
  },
  mealsSection: {
    marginTop: 12,
    marginLeft: 72,
    marginBottom: 8,
  },
  mealsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  mealText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  divider: {
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  packingChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E8F5E9',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipItemText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  shareButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#FF6B6B',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#FF6B6B',
  },
  bottomSpacer: {
    height: 30,
  },
});