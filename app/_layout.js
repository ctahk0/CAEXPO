import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { requestNotificationPermissions } from '../utils/notifications';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Toast, { BaseToast } from 'react-native-toast-message';
import ErrorBoundary from '../Components/ErrorBoundary';

export default function RootLayout() {
  useEffect(() => {
    async function requestWifiPermissions() {
      if (Platform.OS !== 'android') return;

      const fineStatus = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (fineStatus !== RESULTS.GRANTED) {
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (result !== RESULTS.GRANTED) {
          Toast.show({
            type: 'error',
            text1: 'Dozvola odbijena',
            text2: 'Lokacija je neophodna da bi aplikacija radila ispravno.',
          });
        }
      }
    }

    async function setup() {
      try {
        if (Platform.OS !== 'web') {
          await Promise.all([
            requestWifiPermissions(),
            requestNotificationPermissions(),
          ]);
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Toast.show({
            type: 'info',
            text1: 'Nova verzija je dostupna.',
            text2: 'Ažuriram aplikaciju...',
          });
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log('❌ Greška u setup-u:', e);
        Toast.show({
          type: 'error',
          text1: 'Greška',
          text2: 'Problem prilikom podešavanja aplikacije.',
        });
      }
    }

    setup();
  }, []);

  // Prilagođena konfiguracija za Toast
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ height: 80, width: '90%', borderLeftColor: 'green', backgroundColor: '#e0ffe0' }}
        contentContainerStyle={{ padding: 15 }}
        text1Style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}
        text2Style={{ fontSize: 16, color: '#333' }}
      />
    ),
    error: (props) => (
      <BaseToast
        {...props}
        style={{ height: 80, width: '90%', borderLeftColor: 'red', backgroundColor: '#ffe0e0' }}
        contentContainerStyle={{ padding: 15 }}
        text1Style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}
        text2Style={{ fontSize: 16, color: '#333' }}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={{ height: 80, width: '90%', borderLeftColor: 'blue', backgroundColor: '#e0f0ff' }}
        contentContainerStyle={{ padding: 15 }}
        text1Style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}
        text2Style={{ fontSize: 16, color: '#333' }}
      />
    ),
  };

  return (
    <>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }} />
      </ErrorBoundary>
      <Toast config={toastConfig} />
    </>
  );
}