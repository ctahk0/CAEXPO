import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { saveData, getData } from '../utils/storage';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { EXPO_URL, EXPO_KEY } from '@env';

const MAX_ATTEMPTS = 4;
const BLOCK_DURATION_MINUTES = 5;

export default function ActivationScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkBlockStatus = async () => {
      const blockedUntil = await getData('activation_block_until');
      const now = Date.now();

      if (blockedUntil && parseInt(blockedUntil) > now) {
        setIsBlocked(true);
        const remaining = Math.ceil((parseInt(blockedUntil) - now) / 1000);
        setTimeLeft(remaining);
      } else {
        setIsBlocked(false);
        setTimeLeft(0);
      }

      const savedAttempts = await getData('activation_attempts');
      setAttempts(savedAttempts ? parseInt(savedAttempts) : 0);
    };

    checkBlockStatus();

    const interval = setInterval(() => {
      if (isBlocked && timeLeft > 0) {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, timeLeft]);

  const handleActivate = async () => {
    if (isBlocked) return;

    try {
      const res = await axios.post(`${EXPO_URL}/validate-code`, { code }, {
        headers: { 'x-api-key': EXPO_KEY },
      });

      if (res.data.success) {
        await saveData('activationCode', String(code));
        await saveData('activation_attempts', '0');
        await saveData('activation_block_until', '');
        router.replace('/user-select');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        await saveData('activation_attempts', String(newAttempts));

        if (newAttempts >= MAX_ATTEMPTS) {
          const blockUntil = Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000;
          await saveData('activation_block_until', String(blockUntil));
          setIsBlocked(true);
          setTimeLeft(BLOCK_DURATION_MINUTES * 60);
          Toast.show({
            type: 'error',
            text1: 'Previše pokušaja',
            text2: 'Pokušajte ponovo za 5 minuta ili kontaktirajte podršku.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Pogrešan kod',
            text2: `Pokušajte ponovo. Preostalo: ${MAX_ATTEMPTS - newAttempts}`,
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Greška',
          text2: 'Provjerite konekciju ili pokušajte kasnije.',
        });
        console.error('❌ Activation error:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Aktivacija aplikacije</Text>
      <Text style={styles.label}>Unesite aktivacijski kod:</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="npr. CA-1234"
        autoCapitalize="none"
      />
      <TouchableOpacity
        onPress={handleActivate}
        disabled={isBlocked || !code}
        style={[styles.button, isBlocked && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>
          {isBlocked ? `Sačekajte ${timeLeft}s` : 'Aktiviraj'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.help}>❓ Nemate kod? Kontaktirajte nas na:</Text>
      <Text style={styles.email}>support@gealog.ba</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, fontSize: 16,
    backgroundColor: '#f9f9f9', marginBottom: 20,
  },
  button: {
    backgroundColor: 'green', padding: 15, borderRadius: 8,
    alignItems: 'center', marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  help: { textAlign: 'center', marginTop: 10, fontSize: 14, color: '#555' },
  email: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
});
