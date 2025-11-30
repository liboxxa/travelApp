import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
  Text
} from 'react-native';
import { Button, Card } from 'react-native-paper';

const destinations = [
  {
    name: '大理',
    image: 'https://picsum.photos/400/200?random=1',
    description: '风花雪月，诗和远方',
    bestSeason: '3-5月，9-11月',
    avgBudget: '2000-3000元',
    highlights: ['洱海', '古城', '苍山']
  },
  {
    name: '三亚',
    image: 'https://picsum.photos/400/200?random=2',
    description: '阳光沙滩，热带天堂',
    bestSeason: '10月-次年4月',
    avgBudget: '3000-5000元',
    highlights: ['亚龙湾', '天涯海角', '蜈支洲岛']
  },
  {
    name: '成都',
    image: 'https://picsum.photos/400/200?random=3',
    description: '美食之都，熊猫故乡',
    bestSeason: '3-6月，9-11月',
    avgBudget: '1500-2500元',
    highlights: ['熊猫基地', '宽窄巷子', '锦里']
  },
  {
    name: '西安',
    image: 'https://picsum.photos/400/200?random=4',
    description: '千年古都，历史名城',
    bestSeason: '4-5月，9-10月',
    avgBudget: '1500-2500元',
    highlights: ['兵马俑', '古城墙', '回民街']
  },
  {
    name: '厦门',
    image: 'https://picsum.photos/400/200?random=5',
    description: '文艺小城，海上花园',
    bestSeason: '3-5月，10-12月',
    avgBudget: '2000-3000元',
    highlights: ['鼓浪屿', '环岛路', '曾厝垵']
  },
  {
    name: '杭州',
    image: 'https://picsum.photos/400/200?random=6',
    description: '人间天堂，诗画江南',
    bestSeason: '3-5月，9-11月',
    avgBudget: '2000-3000元',
    highlights: ['西湖', '灵隐寺', '西溪湿地']
  },
  {
    name: '丽江',
    image: 'https://picsum.photos/400/200?random=7',
    description: '纳西古城，浪漫之都',
    bestSeason: '4-5月，9-10月',
    avgBudget: '2500-3500元',
    highlights: ['古城', '玉龙雪山', '泸沽湖']
  },
  {
    name: '桂林',
    image: 'https://picsum.photos/400/200?random=8',
    description: '山水甲天下',
    bestSeason: '4-10月',
    avgBudget: '1500-2500元',
    highlights: ['漓江', '阳朔', '象鼻山']
  },
  {
    name: '重庆',
    image: 'https://picsum.photos/400/200?random=9',
    description: '魔幻山城，火锅之都',
    bestSeason: '3-5月，9-11月',
    avgBudget: '1500-2500元',
    highlights: ['洪崖洞', '解放碑', '磁器口']
  },
  {
    name: '青岛',
    image: 'https://picsum.photos/400/200?random=10',
    description: '红瓦绿树，碧海蓝天',
    bestSeason: '5-10月',
    avgBudget: '2000-3000元',
    highlights: ['栈桥', '八大关', '崂山']
  }
];

export default function BlindBoxModal({ visible, onClose, onConfirm }) {
  const [stage, setStage] = useState('ready');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [displayName, setDisplayName] = useState('?');
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStage('ready');
      setSelectedDestination(null);
      setDisplayName('?');
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const startRolling = () => {
    setStage('rolling');
    
    const shakeAnimation = Animated.sequence([
      Animated.timing(rotateAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]);

    Animated.loop(shakeAnimation, { iterations: 10 }).start();

    let count = 0;
    const maxCount = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * destinations.length);
      setDisplayName(destinations[randomIndex].name);
      count++;
      
      if (count >= maxCount) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * destinations.length);
        const finalDestination = destinations[finalIndex];
        setSelectedDestination(finalDestination);
        setDisplayName(finalDestination.name);
        setStage('result');
        
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 3,
          useNativeDriver: true
        }).start(() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true
          }).start();
        });

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start();
      }
    }, 100);
  };

  const reroll = () => {
    setStage('ready');
    setSelectedDestination(null);
    setDisplayName('?');
    fadeAnim.setValue(0);
    setTimeout(() => startRolling(), 300);
  };

  const confirmSelection = () => {
    if (selectedDestination) {
      onConfirm(selectedDestination);
      onClose();
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg']
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>🎁 盲盒旅游</Text>
          <Text style={styles.subtitle}>
            {stage === 'ready' ? '不知道去哪？让我帮你选！' : ''}
            {stage === 'rolling' ? '正在抽取中...' : ''}
            {stage === 'result' ? '恭喜你抽中了！' : ''}
          </Text>

          <Animated.View 
            style={[
              styles.boxContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: stage === 'rolling' ? rotateInterpolate : '0deg' }
                ]
              }
            ]}
          >
            {stage === 'result' && selectedDestination ? (
              <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
                <Image 
                  source={{ uri: selectedDestination.image }}
                  style={styles.resultImage}
                />
                <Text style={styles.resultName}>{selectedDestination.name}</Text>
                <Text style={styles.resultDesc}>{selectedDestination.description}</Text>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>🌸 最佳季节</Text>
                    <Text style={styles.infoValue}>{selectedDestination.bestSeason}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>💰 人均预算</Text>
                    <Text style={styles.infoValue}>{selectedDestination.avgBudget}</Text>
                  </View>
                </View>

                <View style={styles.highlightsRow}>
                  {selectedDestination.highlights.map((h, i) => (
                    <View key={i} style={styles.highlightTag}>
                      <Text style={styles.highlightText}>{h}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : (
              <View style={styles.box}>
                <Text style={styles.boxIcon}>🎁</Text>
                <Text style={styles.boxText}>{displayName}</Text>
              </View>
            )}
          </Animated.View>

          <View style={styles.buttonContainer}>
            {stage === 'ready' ? (
              <Button
                mode="contained"
                onPress={startRolling}
                style={styles.mainButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                🎲 开始抽取
              </Button>
            ) : null}

            {stage === 'rolling' ? (
              <Button
                mode="contained"
                disabled
                style={styles.mainButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                抽取中...
              </Button>
            ) : null}

            {stage === 'result' ? (
              <View style={styles.resultButtons}>
                <Button
                  mode="contained"
                  onPress={confirmSelection}
                  style={styles.mainButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  ✨ 就去这里！
                </Button>
                <Button
                  mode="outlined"
                  onPress={reroll}
                  style={styles.secondButton}
                  labelStyle={styles.secondButtonLabel}
                >
                  🔄 换一个
                </Button>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#999',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 24,
  },
  boxContainer: {
    marginBottom: 24,
  },
  box: {
    width: 200,
    height: 200,
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
  },
  boxIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  boxText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  resultCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  resultImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  resultName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
  },
  resultDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginTop: 2,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  highlightTag: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 4,
  },
  highlightText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  resultButtons: {
    width: '100%',
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondButton: {
    width: '100%',
    marginTop: 12,
    borderColor: '#FF6B6B',
    borderRadius: 12,
  },
  secondButtonLabel: {
    color: '#FF6B6B',
  },
});