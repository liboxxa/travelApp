import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.title, { opacity }]} />
      <Animated.View style={[styles.line, { width: '60%', opacity }]} />
      <Animated.View style={[styles.line, { width: '80%', opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    height: 120,
  },
  title: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
    width: '40%',
  },
  line: {
    height: 14,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
  },
});