import * as SecureStore from 'expo-secure-store';
import * as React from 'react';
import { Platform } from 'react-native';

// This is the token handler. It is used to store and retrieve the token from the device's secure storage.

export async function storeToken(token: string) {
  if (Platform.OS === 'web') {
    try {
        localStorage.setItem('token', token);
        }
    catch (error) {
        console.log('Error storing the token:', error);
        }
    } else {
        await SecureStore.setItemAsync('token', token);
    }
}

export async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  } else {
    return await SecureStore.getItemAsync('token');
  }
}

export async function deleteToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem('token');
  } else {
    await SecureStore.deleteItemAsync('token');
  }
}