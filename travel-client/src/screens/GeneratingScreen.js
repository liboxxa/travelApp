import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Text
} from 'react-native';
import { Button } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

export default function GeneratingScreen({ navigation, route }) {
  const { destination = '未知目的地' } = route.params || {};
  
  const isMounted = useRef(true);
  const [status, setStatus] = useState('generating');
  const [errorMsg, setErrorMsg] = useState('');
  const [tips, setTips] = useState('正在规划行程...');
  
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const tipsList = [
    '正在分析目的地特色...',
    '正在规划最佳路线...',
    '正在搜索必去景点...',
    '正在推荐特色美食...',
    '正在整理住宿建议...',
    '正在计算预算费用...',
    '正在添加实用贴士...',
    '即将完成...'
  ];

  useEffect(() => {
    isMounted.current = true;

    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    spinAnimation.start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    );
    pulseAnimation.start();

    Animated.timing(progressAnim, {
      toValue: 0.9,
      duration: 8000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false
    }).start();

    let tipIndex = 0;
    const tipInterval = setInterval(() => {
      if (isMounted.current) {
        tipIndex = (tipIndex + 1) % tipsList.length;
        setTips(tipsList[tipIndex]);
      }
    }, 2000);

    generatePlan();

    return () => {
      isMounted.current = false;
      spinAnimation.stop();
      pulseAnimation.stop();
      clearInterval(tipInterval);
    };
  }, []);

  const generatePlan = async () => {
    try {
      const fakeLink = `https://v.douyin.com/${destination}/`;
      
      const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.DOUYIN_EXTRACT}`, {
        link: fakeLink
      });

      if (!isMounted.current) return;

      if (response.data.success) {
        setStatus('success');
        
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        }).start();

        setTimeout(() => {
          if (isMounted.current) {
            navigation.replace('ExtractResult', {
              travelPlan: response.data.travelPlan,
              originalLink: fakeLink
            });
          }
        }, 800);
      }
    } catch (error) {
      if (!isMounted.current) return;
      console.error('生成失败:', error);
      setStatus('error');
      setErrorMsg('生成失败，请重试');
    }
  };

  const handleRetry = () => {
    setStatus('generating');
    setErrorMsg('');
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 0.9,
      duration: 8000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false
    }).start();
    generatePlan();
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* 顶部返回按钮 */}
      <View style={styles.header}>
        <Button 
          icon="arrow-left" 
          mode="text" 
          textColor="#fff" 
          onPress={() => navigation.goBack()}
          style={styles.headerBackBtn}
        >
          返回
        </Button>
      </View>

      <View style={styles.bgDecoration}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.destinationLabel}>目的地</Text>
        <Text style={styles.destinationName}>{String(destination)}</Text>

        <View style={styles.animationContainer}>
          {status === 'generating' ? (
            <View style={styles.animationWrapper}>
              <Animated.View 
                style={[
                  styles.spinnerOuter,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <View style={styles.spinnerInner} />
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <Text style={styles.loadingIcon}>✈️</Text>
              </Animated.View>
            </View>
          ) : null}

          {status === 'success' ? (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✅</Text>
            </View>
          ) : null}

          {status === 'error' ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>😢</Text>
            </View>
          ) : null}
        </View>

        {status === 'generating' ? (
          <View style={styles.textContainer}>
            <Text style={styles.statusText}>AI正在为您规划行程</Text>
            <Text style={styles.tipsText}>{String(tips)}</Text>
          </View>
        ) : null}

        {status === 'success' ? (
          <View style={styles.textContainer}>
            <Text style={styles.statusText}>攻略生成完成！</Text>
            <Text style={styles.tipsText}>即将为您展示...</Text>
          </View>
        ) : null}

        {status === 'error' ? (
          <View style={styles.textContainer}>
            <Text style={styles.statusText}>生成失败</Text>
            <Text style={styles.errorText}>{String(errorMsg)}</Text>
          </View>
        ) : null}

        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
        </View>

        {status === 'error' ? (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={styles.retryButton}
            >
              重新生成
            </Button>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>AI正在为您定制专属攻略</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
  },
  headerBackBtn: {
    alignSelf: 'flex-start',
  },
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    bottom: -50,
    right: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  destinationLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  destinationName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 50,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  animationContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  animationWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerOuter: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderRightColor: 'rgba(255,255,255,0.5)',
  },
  spinnerInner: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 50,
  },
  successContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 60,
  },
  errorContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 60,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  buttonContainer: {
    marginTop: 30,
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});