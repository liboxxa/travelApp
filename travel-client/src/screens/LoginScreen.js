import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
} from 'react-native-paper';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';  // 改为从context文件夹导入
import { API_BASE_URL, ENDPOINTS } from '../config/api';


export default function LoginScreen() {
  const { signIn } = useContext(AuthContext);
  
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const isValidPhone = (p) => /^1[3-9]\d{9}$/.test(p);

  const sendCode = async () => {
    if (!isValidPhone(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    setCodeSending(true);
    try {
      // 2. 使用配置
      const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.SEND_CODE}`, { phone });
      
      if (response.data.success) {
        Alert.alert('成功', '验证码已发送\n\n开发测试验证码：123456');
        setCountdown(60);
      }
    } catch (error) {
      Alert.alert('错误', error.response?.data?.message || '发送失败');
    } finally {
      setCodeSending(false);
    }
  };

  const handleLogin = async () => {
    if (!isValidPhone(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    if (!code || code.length < 4) {
      Alert.alert('提示', '请输入验证码');
      return;
    }

    setLoading(true);
     try {
      // 3. 使用配置
      const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
        phone,
        code
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        await signIn(token, user);
        Alert.alert('成功', user.isNewUser ? '注册成功！' : '登录成功！');
      }
    } catch (error) {
      Alert.alert('错误', error.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const skipLogin = async () => {
    const guestUser = {
      _id: 'guest',
      nickname: '游客',
      phone: '',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
    };
    await signIn('guest', guestUser);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>✈️</Text>
          <Text style={styles.title}>旅行规划师</Text>
          <Text style={styles.subtitle}>记录每一次美好旅程</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="手机号"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            placeholder="请输入手机号"
            keyboardType="phone-pad"
            maxLength={11}
            style={styles.input}
            outlineColor="#ddd"
            activeOutlineColor="#FF6B6B"
            left={<TextInput.Icon icon="phone" />}
          />

          <View style={styles.codeRow}>
            <TextInput
              label="验证码"
              value={code}
              onChangeText={setCode}
              mode="outlined"
              placeholder="输入验证码"
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, styles.codeInput]}
              outlineColor="#ddd"
              activeOutlineColor="#FF6B6B"
              left={<TextInput.Icon icon="lock" />}
            />
            <Button
              mode="outlined"
              onPress={sendCode}
              disabled={countdown > 0 || codeSending}
              loading={codeSending}
              style={styles.codeButton}
              labelStyle={styles.codeButtonLabel}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
          >
            登录 / 注册
          </Button>

          <TouchableOpacity onPress={skipLogin} style={styles.skipButton}>
            <Text style={styles.skipText}>暂不登录，随便看看 →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.agreement}>
            登录即表示同意
            <Text style={styles.link}> 《用户协议》</Text>
            和
            <Text style={styles.link}>《隐私政策》</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    color: '#666',
    marginTop: 8,
    fontSize: 16,
  },
  form: {
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  codeInput: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  codeButton: {
    height: 56,
    justifyContent: 'center',
    borderColor: '#FF6B6B',
  },
  codeButtonLabel: {
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    marginBottom: 16,
  },
  loginButtonContent: {
    height: 50,
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
  },
  skipText: {
    color: '#999',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
  },
  agreement: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  link: {
    color: '#FF6B6B',
  },
});