import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AppState } from 'react-native';
import { saveData, getData } from '../utils/storage';
import axios from 'axios';
import NetInfo from "@react-native-community/netinfo";
import * as Updates from 'expo-updates';
// import { Picker } from "@react-native-picker/picker";
import DropDownPicker from 'react-native-dropdown-picker';
import Logo from "../Components/Logo";
import WaveFooter from '../Components/WaveFooter';
import { EXPO_URL, EXPO_KEY } from '@env';
import { getCurrentWifiSSID, isConnectedToAllowedNetwork } from "../utils/wifi-check";
import Toast from 'react-native-toast-message';

export default function MainScreen() {
  const API_URL = EXPO_URL;
  const API_KEY = EXPO_KEY;
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const ssidRef = useRef(null);

  const [izabraniRadnik, setIzabraniRadnik] = useState(null);
  const [izabranaPJ, setIzabranaPJ] = useState(null);
  const [pjList, setPjList] = useState([]);
  const [status, setStatus] = useState(null);
  const [vrijeme, setVrijeme] = useState(null);
  const [protekloVrijeme, setProtekloVrijeme] = useState(0);
  const [allowedSSIDs, setAllowedSSIDs] = useState([]);
  const [wifiSSID, setWifiSSID] = useState(null);
  const [isAllowedNetwork, setIsAllowedNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [pjOpen, setPJOpen] = useState(false);
  const [pjValue, setPJValue] = useState(null);
  const [pjItems, setPJItems] = useState([]);

  const refreshMainScreen = async () => {
    setIsLoading(true);
    try {
      const [radnik, pj, zadnjiStatus, zadnjeVrijeme, storedPJList] = await Promise.all([
        getData('izabraniRadnik'),
        getData('izabranaPJ'),
        getData('zadnjiStatus'),
        getData('zadnjeVrijeme'),
        getPJList(),
      ]);

      setPjList(storedPJList);
      setPJItems(storedPJList.map(pj => ({ label: pj, value: pj })));
      setPJValue(pj || null);
      setIzabraniRadnik(radnik || null);
      setIzabranaPJ(pj || null);

      const now = new Date();
      const lastTime = zadnjeVrijeme ? new Date(zadnjeVrijeme) : null;

      if (zadnjiStatus === 'prijava' && lastTime) {
        const isDifferentDay = now.toDateString() !== lastTime.toDateString();
        if (isDifferentDay) {
          setStatus(null);
          setVrijeme(null);
          saveData('zadnjiStatus', null);
          saveData('zadnjeVrijeme', null);
        } else {
          setStatus(zadnjiStatus);
          setVrijeme(zadnjeVrijeme);
        }
      } else {
        setStatus(zadnjiStatus || null);
        setVrijeme(zadnjeVrijeme || null);
      }

      if (pj) scrollViewRef.current?.scrollTo({ y: 100, animated: true });
      if (zadnjeVrijeme && zadnjiStatus === 'prijava') {
        const razlikaUSekundama = Math.floor((new Date() - new Date(zadnjeVrijeme)) / 1000);
        setProtekloVrijeme(razlikaUSekundama);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Greška', text2: `Inicijalizacija ekrana neuspešna: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };


  const getPJList = async () => {
    try {
      const jsonValue = await getData('pjList');
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Greška', text2: `Neuspješno dohvatanje liste PJ: ${error.message}` });
      return [];
    }
  };

  useEffect(() => {
    refreshMainScreen();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // console.log("📲 App je aktivan ponovo, radim refresh...");
        refreshMainScreen();
      }
    });

    return () => subscription.remove();
  }, []);


  useEffect(() => {
    const fetchAllowedSSIDs = async () => {
      try {
        const response = await axios.get(`${API_URL}/allowed-wifi`, {
          headers: { "x-api-key": API_KEY },
        });
        setAllowedSSIDs(response.data);
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Greška', text2: `Neuspješno dohvatanje SSID-ova: ${error.message}` });
      }
    };
    fetchAllowedSSIDs();
  }, []);

  useEffect(() => {
    if (!allowedSSIDs.length) return;

    const updateNetworkInfo = async (state) => {
      const ssid = state.type === 'wifi' ? state.details?.ssid || await getCurrentWifiSSID() : null;
      if (ssid !== ssidRef.current) {
        ssidRef.current = ssid;
        setWifiSSID(ssid);
        setIsAllowedNetwork(ssid ? await isConnectedToAllowedNetwork(allowedSSIDs) : false);
      }
    };

    NetInfo.fetch().then(updateNetworkInfo);
    const unsubscribe = NetInfo.addEventListener(updateNetworkInfo);
    return () => unsubscribe();
  }, [allowedSSIDs]);

  useEffect(() => {
    let interval;
    if (status === 'prijava') {
      interval = setInterval(() => setProtekloVrijeme((prev) => prev + 1), 1000);
    }
    return () => interval && clearInterval(interval);
  }, [status]);

  const timelog = async (prijava) => {
    if (!izabranaPJ || !izabraniRadnik) {
      Toast.show({ type: 'error', text1: 'Greška', text2: 'Molimo izaberite poslovnicu i radnika.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/timelog`,
        { PJ: izabranaPJ, Radnik: izabraniRadnik, prijava },
        { headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY } }
      );

      if (response.status === 200) {
        const trenutnoVrijeme = new Date().toISOString();
        const noviStatus = prijava ? 'prijava' : 'odjava';
        await Promise.all([
          saveData('zadnjiStatus', noviStatus),
          saveData('zadnjeVrijeme', trenutnoVrijeme),
        ]);
        setStatus(noviStatus);
        setVrijeme(trenutnoVrijeme);
        setProtekloVrijeme(0);
        Toast.show({ type: 'success', text1: 'Uspješno', text2: `Uspješna ${prijava ? 'prijava' : 'odjava'}!` });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Greška', text2: `Neuspješno registrovanje: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const formatirajVrijeme = (sekunde) => {
    const sati = Math.floor(sekunde / 3600);
    const minute = Math.floor((sekunde % 3600) / 60);
    const sekundeOstatak = sekunde % 60;
    return `${String(sati).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(sekundeOstatak).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Učitavanje...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => status !== 'prijava' && router.push('/settings-screen')}
          disabled={status === 'prijava'}
          style={[styles.settingsButton, { opacity: status === 'prijava' ? 0.5 : 1 }]}
        >
          <Text style={[styles.settingsText, { color: status === 'prijava' ? 'gray' : 'black' }]}>
            ⚙️ Podešavanja
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => status !== 'prijava' && router.push('/timelog-screen')}
          disabled={status === 'prijava'}
          style={[styles.settingsButton, { opacity: status === 'prijava' ? 0.5 : 1 }]}
        >
          <Text style={[styles.settingsText, { color: status === 'prijava' ? 'gray' : 'black' }]}>
            🕒 Pregled
          </Text>
        </TouchableOpacity>
        {Platform.OS !== 'web' && (
          <View>
            <TouchableOpacity onPress={() => Updates.reloadAsync()} style={styles.reloadButton}>
              <Text style={styles.reloadText}>🔄</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Logo />
              <Text style={styles.title}>Dobrodošli {izabraniRadnik}!</Text>
              {vrijeme && (
                <Text style={styles.subtitle}>
                  Zadnja {status === 'prijava' ? 'prijava' : 'odjava'}: {new Date(vrijeme).toLocaleString()}
                </Text>
              )}
              {status === 'prijava' && (
                <Text style={styles.subtitle}>
                  Prijavljeni ste: {formatirajVrijeme(protekloVrijeme)}
                </Text>
              )}
              {!isAllowedNetwork && Platform.OS !== 'web' && (
                <View>
                  <Text style={styles.wifiText}>📡 WiFi: {wifiSSID || "Nema mreže"}</Text>
                  <Text style={styles.warningText}>
                    ⚠️ Povežite se na dozvoljenu WiFi mrežu za prijavu/odjavu!
                  </Text>
                </View>
              )}
            </View>
            <View style={{ zIndex: 1000, marginBottom: pjOpen ? 70 : 20 }}>
              <View>
                <Text style={styles.labels}>Izaberite poslovnicu</Text>
                {pjList.length > 0 ? (
                  <DropDownPicker
                    open={pjOpen}
                    value={pjValue}
                    items={pjItems}
                    setOpen={setPJOpen}
                    setValue={(callback) => {
                      const selectedValue = callback(pjValue);
                      setPJValue(selectedValue);
                      setIzabranaPJ(selectedValue);
                      setPJOpen(false); // ✅ automatski zatvori
                    }}

                    setItems={setPJItems}
                    placeholder="Poslovnica..."
                    disabled={(status === 'prijava' || (!isAllowedNetwork && Platform.OS !== 'web'))}
                    zIndex={1000}
                    searchable={false}
                    style={{ marginBottom: pjOpen ? 150 : 10 }}
                    dropDownContainerStyle={{ zIndex: 2000 }}
                    listMode="SCROLLVIEW"
                  />
                ) : (
                  <Text style={styles.loadingText}>Učitavanje...</Text>
                )}
              </View>
            </View>
            <View style={styles.formAction}>
              {status !== 'prijava' && (
                <TouchableOpacity
                  style={isAllowedNetwork || Platform.OS === 'web' ? styles.btn1 : styles.btnDisabled}
                  onPress={() => timelog(true)}
                  disabled={!isAllowedNetwork && Platform.OS !== 'web' || isLoading}
                >
                  <Text style={styles.btnText}>Prijavi se na posao</Text>
                </TouchableOpacity>
              )}
              {status === 'prijava' && (
                <TouchableOpacity
                  style={isAllowedNetwork || Platform.OS === 'web' ? styles.btn2 : styles.btnDisabled}
                  onPress={() => timelog(false)}
                  disabled={!isAllowedNetwork && Platform.OS !== 'web' || isLoading}
                >
                  <Text style={styles.btnText}>Odjavi se sa posla</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView >
      </KeyboardAvoidingView >
      <View style={styles.footer}><WaveFooter /></View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 2,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    zIndex:998,
  },
  reloadButton: { padding: 10 },
  reloadText: { fontSize: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  settingsButton: { padding: 10 },
  settingsText: { fontSize: 15 },
  scrollContent: { flexGrow: 1, paddingBottom: 100 },
  content: { justifyContent: "center", padding: 30 },
  header: { alignItems: 'center', justifyContent: 'center', marginVertical: 30, marginBottom: 45 },
  title: { fontSize: 24, fontWeight: '700', color: '#1D2A32', marginBottom: 6 },
  subtitle: { fontSize: 15, fontWeight: '500', color: '#929292' },
  wifiText: { marginTop: 10 },
  warningText: { color: "red", fontSize: 16, textAlign: "center", marginTop: 10 },
  labels: { fontSize: 18, fontWeight: '500', color: '#929292', paddingBottom: 10 },
  picker: { backgroundColor: "white", elevation: 5, marginBottom: 35, fontSize: 16, minHeight: 30 },
  disabledPicker: { backgroundColor: "#e0e0e0", borderColor: "#b0b0b0", opacity: 0.6 },
  loadingText: { textAlign: 'center', marginTop: 20, color: "gray" },
  formAction: { marginTop: 4, marginBottom: 16, zIndex: 1005 },
  btn1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderRadius: 30, paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, backgroundColor: 'green', borderColor: 'green', zIndex: 300 },
  btn2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderRadius: 30, paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, backgroundColor: 'red', borderColor: 'red', zIndex: 300 },
  btnDisabled: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderRadius: 30, paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, backgroundColor: 'gray', borderColor: 'darkgray', opacity: 0.5, zIndex: 300 },
  btnText: { fontSize: 18, lineHeight: 26, fontWeight: '600', color: '#fff' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});