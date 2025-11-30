import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 导入Context
import { AuthContext } from './src/context/AuthContext';

// 页面导入
import HomeScreen from './src/screens/HomeScreen';
import CollectionsScreen from './src/screens/CollectionsScreen';
import CollectionDetailScreen from './src/screens/CollectionDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DouyinExtractScreen from './src/screens/DouyinExtractScreen';
import ExtractResultScreen from './src/screens/ExtractResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LoginScreen from './src/screens/LoginScreen';
import PublishScreen from './src/screens/PublishScreen';
import MyRoutesScreen from './src/screens/MyRoutesScreen';
import GeneratingScreen from './src/screens/GeneratingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AboutScreen from './src/screens/AboutScreen';
import HelpScreen from './src/screens/HelpScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DouyinExtract" 
        component={DouyinExtractScreen} 
        options={{ 
          title: '抖音攻略提取',
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name="Generating" 
        component={GeneratingScreen} 
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="ExtractResult" 
        component={ExtractResultScreen} 
        options={{ 
          title: '旅游攻略',
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name="Collections" 
        component={CollectionsScreen} 
        options={{ 
          title: '我的收藏',
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name="CollectionDetail" 
        component={CollectionDetailScreen} 
        options={{ 
          title: '收藏详情',
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
      name="History" 
       component={HistoryScreen} 
       options={{ 
      title: '历史记录',
       headerStyle: { backgroundColor: '#FF6B6B' },
       headerTintColor: '#fff'
       }}
     />
     <Stack.Screen 
        name="MyRoutes" 
        component={MyRoutesScreen} 
        options={{ 
         title: '我发布的路线',
         headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }}
      />
      {/* 新增下面这三个页面 */}
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: '设置', 
          headerStyle: { backgroundColor: '#fff' }, 
          headerTintColor: '#333' 
        }} 
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ 
          title: '关于我们', 
          headerStyle: { backgroundColor: '#fff' }, 
          headerTintColor: '#333' 
        }} 
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen} 
        options={{ 
          title: '帮助与反馈', 
          headerStyle: { backgroundColor: '#fff' }, 
          headerTintColor: '#333' 
        }} 
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === '首页') iconName = 'home';
          else if (route.name === '发布') iconName = 'add-circle';
          else if (route.name === '我的') iconName = 'person';
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="首页" 
        component={HomeStack} 
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // 获取当前焦点的路由名称
            const state = navigation.getState();
            
            if (state) {
              // 找到 '首页' Tab 的 state
              const homeTabRoute = state.routes.find(r => r.name === '首页');
              
              // 如果已经在首页 Tab，且堆栈深度 > 1 (说明不在根页面)
              if (homeTabRoute?.state?.index > 0) {
                // 阻止默认行为
                e.preventDefault();
                
                // 重置堆栈到第一个页面 (HomeMain)
                navigation.navigate('首页', {
                  screen: 'HomeMain'
                });
              }
            }
          },
        })}
      />
      <Tab.Screen name="发布" component={PublishScreen} />
      <Tab.Screen name="我的" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        setUserToken(token);
        setUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.log('检查登录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token, userData) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUserToken(token);
    setUser(userData);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUserToken(null);
    setUser(null);
  };
  // 新增：更新用户信息
  const updateUser = async (newData) => {
    const updatedUser = { ...user, ...newData };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };
  const authContextValue = {
    user,
    userToken,
    signIn,
    signOut,
    updateUser, // 导出新方法
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <PaperProvider>
        <NavigationContainer>
          {userToken === null ? (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs" component={MainTabs} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </PaperProvider>
    </AuthContext.Provider>
  );
}