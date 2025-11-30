import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container}>
      <List.Section title="常见问题">
        <List.Accordion title="如何生成旅游攻略？" left={props => <List.Icon {...props} icon="help-circle-outline" />}>
          <List.Item titleNumberOfLines={10} title="1. 在首页输入目的地搜索&#10;2. 复制抖音视频链接，点击'抖音提取'&#10;3. 使用'盲盒旅游'随机抽取" />
        </List.Accordion>

        <List.Accordion title="发布的攻略如何设为私密？" left={props => <List.Icon {...props} icon="lock-outline" />}>
          <List.Item titleNumberOfLines={3} title="在发布页面的第一步，关闭'公开可见'开关即可。" />
        </List.Accordion>

        <List.Accordion title="如何删除收藏？" left={props => <List.Icon {...props} icon="delete-outline" />}>
          <List.Item titleNumberOfLines={3} title="进入'我的收藏' -> 点击对应攻略 -> 在详情页点击右上角删除图标。" />
        </List.Accordion>
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' }
});