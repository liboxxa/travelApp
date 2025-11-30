import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  userToken: null,
  signIn: async () => {},
  signOut: async () => {},
  updateUser: async () => {}, // 新增
});