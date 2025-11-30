import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  Chip,
  ProgressBar,
  ActivityIndicator
} from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/api';


export default function DouyinExtractScreen({ navigation }) {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  // 粘贴
  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setLink(text);
        if (text.includes('douyin.com')) {
          Alert.alert('✅', '已识别到抖音链接');
        }
      } else {
        Alert.alert('提示', '剪贴板为空');
      }
    } catch (error) {
      Alert.alert('错误', '无法读取剪贴板');
    }
  };

  // 提取
  const handleExtract = async () => {
    if (!link.trim()) {
      Alert.alert('提示', '请输入或粘贴链接');
      return;
    }

    setLoading(true);
    setProgress(0.1);
    setProgressText('正在解析链接...');

    try {
      setProgress(0.3);
      setProgressText('正在分析内容...');

      const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.DOUYIN_EXTRACT}`, {
        link: link
      });

      setProgress(0.7);
      setProgressText('正在生成攻略...');

      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(1);
      setProgressText('完成！');

      setTimeout(() => {
        navigation.navigate('ExtractResult', { 
          travelPlan: response.data.travelPlan,
          originalLink: link
        });
        setLoading(false);
        setProgress(0);
        setLink('');
      }, 300);

    } catch (error) {
      console.error('提取失败:', error);
      setLoading(false);
      setProgress(0);
      Alert.alert('提取失败', '请检查网络连接后重试');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 说明 */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>📱 使用说明</Text>
            <Text style={styles.stepText}>1️⃣ 打开抖音，找到旅游视频</Text>
            <Text style={styles.stepText}>2️⃣ 点击分享 → 复制链接</Text>
            <Text style={styles.stepText}>3️⃣ 回到这里粘贴链接</Text>
            <Text style={styles.stepText}>4️⃣ 点击提取，AI生成攻略</Text>
          </Card.Content>
        </Card>

        {/* 输入 */}
        <Card style={styles.inputCard}>
          <Card.Content>
            <Text style={styles.label}>粘贴抖音分享链接</Text>
            <TextInput
              mode="outlined"
              placeholder="https://v.douyin.com/xxxxx/"
              value={link}
              onChangeText={setLink}
              multiline
              numberOfLines={3}
              style={styles.input}
              outlineColor="#ddd"
              activeOutlineColor="#FF6B6B"
              disabled={loading}
            />
            
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={pasteFromClipboard}
                style={styles.pasteButton}
                icon="content-paste"
                disabled={loading}
              >
                粘贴
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => setLink('')}
                style={styles.clearButton}
                icon="close"
                disabled={loading}
              >
                清空
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* 进度 */}
        {loading && (
          <Card style={styles.progressCard}>
            <Card.Content>
              <View style={styles.progressHeader}>
                <ActivityIndicator size="small" color="#FF6B6B" />
                <Text style={styles.progressText}>{progressText}</Text>
              </View>
              <ProgressBar progress={progress} color="#FF6B6B" style={styles.progressBar} />
            </Card.Content>
          </Card>
        )}

        {/* 提取按钮 */}
        <Button
          mode="contained"
          onPress={handleExtract}
          loading={loading}
          disabled={loading}
          style={styles.extractButton}
          contentStyle={styles.extractButtonContent}
          icon="map-search"
        >
          {loading ? '正在提取...' : '🚀 提取旅游规划'}
        </Button>

        {/* 支持的类型 */}
        <Card style={styles.exampleCard}>
          <Card.Content>
            <Text style={styles.exampleTitle}>💡 支持的视频类型</Text>
            <View style={styles.chipContainer}>
              <Chip style={styles.chip}>旅游攻略</Chip>
              <Chip style={styles.chip}>景点介绍</Chip>
              <Chip style={styles.chip}>美食探店</Chip>
              <Chip style={styles.chip}>民宿酒店</Chip>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#FFF9E6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
  inputCard: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 12,
    minHeight: 80,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  pasteButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#FF6B6B',
  },
  clearButton: {
    flex: 1,
    marginLeft: 8,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    marginLeft: 12,
    color: '#666',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  extractButton: {
    backgroundColor: '#FF6B6B',
    marginBottom: 16,
    borderRadius: 12,
  },
  extractButtonContent: {
    height: 50,
  },
  exampleCard: {
    backgroundColor: '#F0F8FF',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E3F2FD',
  },
});