// storage.js
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Spremanje podataka
export const saveData = async (key, value) => {
    try {
        // console.log(key, value);
        if (Platform.OS === 'web') {
            await AsyncStorage.setItem(key, value);
        } else {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            await SecureStore.setItemAsync(key, stringValue);
            // await SecureStore.setItemAsync(key, value);
        }
    } catch (error) {
        console.error("❌ Greška pri čuvanju podataka:", error);
    }
};

// Dohvaćanje podataka
export const getData = async (key) => {
    try {
        if (Platform.OS === 'web') {
            return await AsyncStorage.getItem(key);
        } else {
            return await SecureStore.getItemAsync(key);
        }
    } catch (error) {
        console.error("❌ Greška pri dohvaćanju podataka:", error);
        return null;
    }
};

// Brisanje podataka
export const removeData = async (key) => {
    try {
        if (Platform.OS === 'web') {
            await AsyncStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    } catch (error) {
        console.error("❌ Greška pri brisanju podataka:", error);
    }
};
