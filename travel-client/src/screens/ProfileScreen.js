import React, { useContext, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Text, Avatar, Button, List, Divider, Card, Portal, Dialog, TextInput } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { getCollections } from '../utils/storage';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

export default function ProfileScreen() {
  const { user, signOut, updateUser, userToken } = useContext(AuthContext);
  const navigation = useNavigation();
  
  const [stats, setStats] = useState({ published: 0, collected: 0 });
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');

  const isGuest = user?._id === 'guest';

  useFocusEffect(
    useCallback(() => {
      if (!isGuest) {
        loadStats();
      }
    }, [userToken])
  );

  const loadStats = async () => {
    try {
      const collections = await getCollections();
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.MY_ROUTES}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      setStats({
        collected: collections.length,
        published: response.data.success ? response.data.data.length : 0
      });
    } catch (error) {
      console.log('加载统计失败', error);
    }
  };

  const openEdit = () => {
    console.log('点击修改按钮');
    setEditName(user?.nickname || '');
    setEditVisible(true);
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }
    await updateUser({ nickname: editName });
    setEditVisible(false);
    Alert.alert('成功', '个人资料已更新');
  };

  // 1. 点击头像触发的函数
    const changeAvatar = async () => {
    console.log('👉 点击了头像，准备打开相册...');

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要访问相册才能更换头像，请在设置中开启权限。');
        return;
      }

      // 👇 修改了这里：改回 MediaTypeOptions
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // 忽略警告，用这个才能跑通
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      console.log('📸 相册选择结果:', result.canceled ? '取消' : '已选择');

      if (!result.canceled) {
        // 注意：新版 expo-image-picker 返回的是 assets 数组
        const uri = result.assets[0].uri;
        uploadAvatar(uri);
      }
    } catch (error) {
      console.error('打开相册失败:', error);
      Alert.alert('错误', '打开相册失败: ' + error.message);
    }
  };

  // 2. 上传逻辑
  const uploadAvatar = async (uri) => {
    try {
      console.log('🚀 开始上传头像:', uri);
      
      // 构造文件名
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      const formData = new FormData();
      formData.append('avatar', {
        uri: uri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      });

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data, // 关键：防止axios转换FormData
      });

      console.log('✅ 上传响应:', response.data);

      if (response.data.success) {
        // 立即更新本地状态
        await updateUser({ avatar: response.data.url });
        Alert.alert('成功', '头像已更新');
      }
    } catch (error) {
      console.error('❌ 上传失败:', error);
      Alert.alert('失败', '头像上传失败，请确保后端服务器运行中');
    }
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: signOut }
    ]);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={!isGuest ? changeAvatar : null}
            activeOpacity={0.7}
            >
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Avatar.Icon size={80} icon="account" style={styles.avatar} />
              )}
              {/* 编辑图标角标 */}
                {!isGuest && (
                 <View style={styles.editBadge}>
                 <Text style={styles.editBadgeText}>📷</Text>
                </View>
                )}
            </TouchableOpacity>
            
            <View style={styles.nameContainer}>
              <Text style={styles.nickname}>{user?.nickname || '未登录'}</Text>
              {!isGuest && (
                <TouchableOpacity 
                  onPress={openEdit}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.editBtnContainer}
                >
                  <Text style={styles.editIcon}> ✎ 修改</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!isGuest && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.published}</Text>
                <Text style={styles.statLabel}>发布</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.collected}</Text>
                <Text style={styles.statLabel}>收藏</Text>
              </View>
            </View>
          )}
        </Card>

        {!isGuest && (
          <Card style={styles.menuCard}>
            <List.Item
              title="我发布的路线"
              left={props => <List.Icon {...props} icon="map-marker-path" color="#FF6B6B" />}
              right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
              onPress={() => navigation.navigate('首页', { screen: 'MyRoutes' })}
            />
            <Divider />
            <List.Item
              title="我的收藏"
              left={props => <List.Icon {...props} icon="heart" color="#FF6B6B" />}
              right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
              onPress={() => navigation.navigate('首页', { screen: 'Collections' })}
            />
            <Divider />
            <List.Item
              title="历史记录"
              left={props => <List.Icon {...props} icon="history" color="#FF6B6B" />}
              right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
              onPress={() => navigation.navigate('首页', { screen: 'History' })}
            />
          </Card>
        )}

        <Card style={styles.menuCard}>
          <List.Item
            title="设置"
            left={props => <List.Icon {...props} icon="cog" color="#666" />}
            right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
             onPress={() => navigation.navigate('首页', { screen: 'Settings' })}
          />
          <Divider />
          <List.Item
            title="关于我们"
            left={props => <List.Icon {...props} icon="information" color="#666" />}
            right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
            onPress={() => navigation.navigate('首页', { screen: 'About' })}
          />
          <Divider />
          <List.Item
            title="帮助与反馈"
            left={props => <List.Icon {...props} icon="help-circle" color="#666" />}
            right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
            onPress={() => navigation.navigate('首页', { screen: 'Help' })}
          />
        </Card>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#FF6B6B"
        >
          {isGuest ? '去登录' : '退出登录'}
        </Button>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <Portal>
        <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)}>
          <Dialog.Title>修改昵称</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="昵称"
              value={editName}
              onChangeText={setEditName}
              mode="outlined"
              activeOutlineColor="#FF6B6B"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditVisible(false)} textColor="#666">取消</Button>
            <Button onPress={saveProfile} textColor="#FF6B6B">保存</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileCard: { margin: 16, padding: 20, backgroundColor: '#fff' },
  profileHeader: { alignItems: 'center' },
  avatarImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0f0f0' },
  avatar: { backgroundColor: '#FF6B6B' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: '#333', width: 24, height: 24, 
    borderRadius: 12, justifyContent: 'center', alignItems: 'center'
  },
  editBadgeText: { color: '#fff', fontSize: 12 },
  nameContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  nickname: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  editBtnContainer: { marginLeft: 8, padding: 4 },
  editIcon: { color: '#999', fontSize: 14 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0'
  },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: '80%', backgroundColor: '#f0f0f0' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { color: '#999', fontSize: 12, marginTop: 4 },
  menuCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff' },
  logoutButton: { marginHorizontal: 16, marginTop: 8, borderColor: '#FF6B6B', backgroundColor: '#fff' },
  bottomSpace: { height: 30 }
});