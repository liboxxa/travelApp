import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Card } from 'react-native-paper';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>✈️</Text>
        <Text style={styles.appName}>旅行规划师</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.text}>
            旅行规划师是一款基于AI技术的智能旅游助手。
            {"\n\n"}
            我们致力于帮助每一个热爱旅行的人，通过简单的链接分享或关键词搜索，快速生成详尽的行程规划。
            {"\n\n"}
            开发者：重庆理工大学（两江校区）4栋0719
            {"\n"}
            联系方式：2583036483@qq.com
          </Text>
        </Card.Content>
      </Card>
      
      <Text style={styles.footer}>Copyright © 2025 Travel Planner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  logo: { fontSize: 64, marginBottom: 10 },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  version: { color: '#666', marginTop: 5 },
  card: { backgroundColor: '#fff' },
  text: { lineHeight: 24, color: '#444' },
  footer: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 12 }
});