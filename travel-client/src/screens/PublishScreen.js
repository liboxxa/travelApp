import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Chip,
  Switch
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

export default function PublishScreen({ navigation }) {
  const { user, userToken } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [beautifying, setBeautifying] = useState(false);
  
  const [formData, setFormData] = useState({
    destination: '',
    days: '',
    budget: '',
    title: '',
    content: '',
    tags: [],
    isPublic: true,
    images: []
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!user) {
        Alert.alert(
          '提示',
          '请先登录后再发布攻略',
          [
            { text: '取消', onPress: () => navigation.navigate('HomeMain') },
            { text: '去登录', onPress: () => navigation.navigate('Login') }
          ]
        );
      }
    });
    return unsubscribe;
  }, [navigation, user]);

  const availableTags = ['自然风光', '人文历史', '美食之旅', '亲子游', '穷游', '奢华度假'];

  const toggleTag = (tag) => {
    const currentTags = formData.tags;
    if (currentTags.includes(tag)) {
      setFormData({ ...formData, tags: currentTags.filter(t => t !== tag) });
    } else {
      if (currentTags.length >= 3) {
        Alert.alert('提示', '最多选择3个标签');
        return;
      }
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('提示', '需要访问相册权限才能添加图片');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('相册错误:', error);
    }
  };

  // ✅ 修复后的上传函数
  const uploadImage = async (uri) => {
    try {
      const data = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      data.append('avatar', {
        uri: uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      // 确保调用的是上传接口 /api/upload
      // 注意：这里不要用 ENDPOINTS.MY_ROUTES，那个是列表接口！
      const response = await axios.post(`${API_BASE_URL}/api/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, response.data.url]
        }));
        Alert.alert('成功', '图片上传成功');
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      Alert.alert('错误', '图片上传失败');
    }
  };

  const handleBeautify = async () => {
    if (!formData.content) {
      Alert.alert('提示', '请先填写一些内容');
      return;
    }
    setBeautifying(true);
    setTimeout(() => {
      const beautifiedContent = `✨【${formData.destination || '目的地'}】${formData.days || '3天'}深度游攻略✨\n\n📍 必打卡：\n${formData.content}\n\n💡 实用贴士：\n1. 注意防晒 🌞\n2. 提前预订住宿 🏨\n3. 尝尝当地美食 🍜\n\n#${formData.destination || '旅行'} #旅游攻略 #自由行`;
      setFormData({ ...formData, content: beautifiedContent });
      setBeautifying(false);
      Alert.alert('✨', '文案已美化！');
    }, 1500);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.destination || !formData.days || !formData.budget) {
        Alert.alert('提示', '请填写完整基本信息');
        return;
      }
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert('提示', '请填写标题和内容');
      return;
    }

    setLoading(true);

    try {
      // 发布接口
      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.PUBLISH}`,
        formData,
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );

      if (response.data.success) {
        Alert.alert(
          '发布成功',
          '你的攻略已发布！',
          [
            {
              text: '确定',
              onPress: () => {
                setFormData({
                  destination: '',
                  days: '',
                  budget: '',
                  title: '',
                  content: '',
                  tags: [],
                  isPublic: true,
                  images: []
                });
                setStep(1);
                navigation.navigate('首页', { screen: 'MyRoutes' });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('发布失败:', error);
      Alert.alert('错误', error.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <View style={styles.centerContainer}><Text>请登录</Text></View>;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>发布攻略</Text>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step >= 1 && styles.activeDot]} />
              <View style={[styles.stepLine, step >= 2 && styles.activeLine]} />
              <View style={[styles.stepDot, step >= 2 && styles.activeDot]} />
            </View>
            <Text style={styles.stepText}>步骤 {step}/2</Text>
          </View>

          {step === 1 ? (
            <View style={styles.formSection}>
              <TextInput
                label="目的地"
                value={formData.destination}
                onChangeText={(text) => setFormData({ ...formData, destination: text })}
                mode="outlined"
                style={styles.input}
                placeholder="例如：大理"
                activeOutlineColor="#FF6B6B"
              />
              <View style={styles.row}>
                <TextInput
                  label="游玩天数"
                  value={formData.days}
                  onChangeText={(text) => setFormData({ ...formData, days: text })}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  placeholder="例如：3天"
                  activeOutlineColor="#FF6B6B"
                />
                <TextInput
                  label="人均预算"
                  value={formData.budget}
                  onChangeText={(text) => setFormData({ ...formData, budget: text })}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  placeholder="例如：2000"
                  right={<TextInput.Affix text="元" />}
                  activeOutlineColor="#FF6B6B"
                />
              </View>
              <Text style={styles.label}>选择标签</Text>
              <View style={styles.tagContainer}>
                {availableTags.map((tag) => (
                  <Chip
                    key={tag}
                    selected={formData.tags.includes(tag)}
                    onPress={() => toggleTag(tag)}
                    style={[styles.tag, formData.tags.includes(tag) && { backgroundColor: '#FFE5E5' }]}
                    textStyle={formData.tags.includes(tag) && { color: '#FF6B6B' }}
                    showSelectedOverlay
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>公开可见</Text>
                <Switch
                  value={formData.isPublic}
                  onValueChange={(val) => setFormData({ ...formData, isPublic: val })}
                  color="#FF6B6B"
                />
              </View>
            </View>
          ) : (
            <View style={styles.formSection}>
              <TextInput
                label="标题"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                mode="outlined"
                style={styles.input}
                placeholder="标题"
                activeOutlineColor="#FF6B6B"
              />
              <View style={styles.imageSection}>
                <Text style={styles.label}>添加图片</Text>
                <ScrollView horizontal style={styles.imageScroll}>
                  {formData.images.map((img, index) => (
                    <Image key={index} source={{ uri: img }} style={styles.uploadedImage} />
                  ))}
                  <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                    <Text style={styles.plusText}>+</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
              <View style={styles.contentHeader}>
                <Text style={styles.label}>正文内容</Text>
                <TouchableOpacity onPress={handleBeautify} disabled={beautifying}>
                  <Text style={styles.beautifyBtn}>
                    {beautifying ? '✨ 美化中...' : '✨ AI一键美化'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                mode="outlined"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={10}
                placeholder="写下你的旅行故事..."
                activeOutlineColor="#FF6B6B"
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            {step === 2 && (
              <Button
                mode="outlined"
                onPress={() => setStep(1)}
                style={styles.backButton}
                textColor="#666"
              >
                上一步
              </Button>
            )}
            <Button
              mode="contained"
              onPress={handleNext}
              loading={loading}
              disabled={loading}
              style={[styles.nextButton, step === 1 && styles.fullWidth]}
            >
              {step === 1 ? '下一步' : '立即发布'}
            </Button>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  scrollContent: { padding: 20, flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#eee' },
  activeDot: { backgroundColor: '#FF6B6B' },
  stepLine: { width: 60, height: 2, backgroundColor: '#eee', marginHorizontal: 4 },
  activeLine: { backgroundColor: '#FF6B6B' },
  stepText: { fontSize: 12, color: '#999' },
  formSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  label: { fontSize: 14, color: '#666', marginBottom: 8, marginTop: 8 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { marginRight: 8, marginBottom: 8, backgroundColor: '#f0f0f0' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  switchLabel: { fontSize: 16, color: '#333' },
  imageSection: { marginBottom: 16 },
  imageScroll: { flexDirection: 'row', marginTop: 8 },
  uploadedImage: { width: 80, height: 80, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' },
  addImageBtn: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  plusText: { fontSize: 24, color: '#999' },
  contentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  beautifyBtn: { fontSize: 14, color: '#FF6B6B', fontWeight: '600' },
  textArea: { height: 200 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 40 },
  backButton: { width: '45%', borderColor: '#666' },
  nextButton: { width: '45%', backgroundColor: '#FF6B6B' },
  fullWidth: { width: '100%' },
});