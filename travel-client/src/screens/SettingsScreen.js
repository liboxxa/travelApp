import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Divider, Text } from 'react-native-paper';

export default function SettingsScreen() {
  const [isDark, setIsDark] = useState(false);
  const [isNotif, setIsNotif] = useState(true);
  const [isLocation, setIsLocation] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>通用</List.Subheader>
        <List.Item
          title="深色模式"
          left={() => <List.Icon icon="theme-light-dark" />}
          right={() => <Switch value={isDark} onValueChange={setIsDark} color="#FF6B6B" />}
        />
        <Divider />
        <List.Item
          title="消息通知"
          left={() => <List.Icon icon="bell-outline" />}
          right={() => <Switch value={isNotif} onValueChange={setIsNotif} color="#FF6B6B" />}
        />
        <List.Item
          title="位置服务"
          description="推荐附近的热门攻略"
          left={() => <List.Icon icon="map-marker-outline" />}
          right={() => <Switch value={isLocation} onValueChange={setIsLocation} color="#FF6B6B" />}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>缓存与数据</List.Subheader>
        <List.Item
          title="清除缓存"
          description="占用空间: 12.5MB"
          left={() => <List.Icon icon="delete-sweep-outline" />}
          onPress={() => alert('缓存已清理')}
        />
      </List.Section>
      
      <View style={styles.footer}>
        <Text style={styles.version}>当前版本 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  footer: { alignItems: 'center', marginTop: 20 },
  version: { color: '#999' }
});