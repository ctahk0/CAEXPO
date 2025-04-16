import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import DatePickerComponent from '../Components/DatePicker';
import axios from 'axios';
import { EXPO_URL, EXPO_KEY } from '@env';
import { useRouter } from 'expo-router';
import { getData, removeData } from '../utils/storage';
import Toast from 'react-native-toast-message';
import NotificationsSettings from '../Components/NotificationsSettings';

export default function SettingsScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [absenceReason, setAbsenceReason] = useState('Godisnji odmor');
  const [activeTab, setActiveTab] = useState('notifikacije');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = EXPO_URL;
  const API_KEY = EXPO_KEY;

  const handleGoBack = () => {
    router.canGoBack() ? router.back() : router.replace('/user-select');
  };

  const saveVacation = async () => {
    const radnik = await getData('izabraniRadnik');
    if (!radnik) {
      Toast.show({ type: 'error', text1: 'Greška', text2: 'Nema izabranog radnika.' });
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Postavljamo sate, minute, sekunde i milisekunde na 0

    // Provjera da startDate nije u prošlosti
    if (startDate < today) {
      Toast.show({ type: 'error', text1: 'Greška', text2: 'Datum početka ne može biti u prošlosti!' });
      return;
    }
    if (endDate < startDate) {
      Toast.show({ type: 'error', text1: 'Greška', text2: 'Datum kraja ne može biti prije datuma početka!' });
      return;
    }
    console.log(startDate);

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/status_radnika`,
        {
          radnik,
          status: absenceReason,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
        { headers: { "x-api-key": API_KEY } }
      );

      if (response.status === 200) {
        Toast.show({ type: 'success', text1: 'Uspešno', text2: 'Vaš odmor je evidentiran!' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Greška', text2: `Neuspešno snimanje: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelVacation = async () => {
    const radnik = await getData('izabraniRadnik');
    if (!radnik) {
      Toast.show({ type: 'error', text1: 'Greška', text2: 'Nema izabranog radnika.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/status_radnika`,
        {
          radnik,
          status: "Radni dan",
          startDate: null,
          endDate: null,
        },
        { headers: { "x-api-key": API_KEY } }
      );

      if (response.status === 200) {
        Toast.show({ type: 'success', text1: 'Uspešno', text2: 'Odsustvo je poništeno, vraćen status "Radni dan".' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Greška', text2: `Neuspešno poništavanje: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmLogout = () => setShowPasswordPrompt(true);

  const handleLogout = async () => {
    if (adminPassword !== '1234') { // TODO: Zameni sa backend validacijom
      Toast.show({ type: 'error', text1: 'Greška', text2: 'Pogrešna administratorska šifra.' });
      return;
    }

    try {
      await removeData('izabraniRadnik');
      Toast.show({ type: 'success', text1: 'Uspešno', text2: 'Odjavljeni ste.' });
      router.replace('/user-select');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Greška', text2: `Neuspešna odjava: ${error.message}` });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Podešavanja</Text>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.closeButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'notifikacije' && styles.activeTab]}
          onPress={() => setActiveTab('notifikacije')}
        >
          <Text style={[styles.tabText, activeTab === 'notifikacije' && styles.activeTabText]}>
            🔔 Notifikacije
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'odmor' && styles.activeTab]}
          onPress={() => setActiveTab('odmor')}
        >
          <Text style={[styles.tabText, activeTab === 'odmor' && styles.activeTabText]}>
            📅 Godišnji
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentWrapper}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {activeTab === 'notifikacije' && <NotificationsSettings />}
            {activeTab === 'odmor' && (
              <>
                <Text style={styles.label}>📌 Razlog odsustva:</Text>
                <Picker
                  selectedValue={absenceReason}
                  onValueChange={setAbsenceReason}
                  style={styles.picker}
                >
                  <Picker.Item label="Godišnji odmor" value="Godisnji odmor" />
                  <Picker.Item label="Slobodan dan" value="Slobodan dan" />
                  <Picker.Item label="Bolovanje" value="Bolovanje" />
                  <Picker.Item label="Ostalo" value="Ostalo" />
                </Picker>
                <Text style={styles.label}>Početak:</Text>
                <DatePickerComponent
                  value={startDate}
                  mode="date"
                  display="default"
                  onDateChange={(selectedDate) => selectedDate && setStartDate(selectedDate)}
                />
                <Text style={styles.label}>Kraj:</Text>
                <DatePickerComponent
                  value={endDate}
                  mode="date"
                  display="default"
                  onDateChange={(selectedDate) => selectedDate && setEndDate(selectedDate)}
                />
                <TouchableOpacity onPress={saveVacation} style={styles.btn1} disabled={isLoading}>
                  <Text style={styles.btnText}>Sačuvaj</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelVacation} style={styles.btn2} disabled={isLoading}>
                  <Text style={styles.btnText}>Poništi</Text>
                </TouchableOpacity>
              </>
            )}
            {showPasswordPrompt && (
              <View style={styles.passwordContainer}>
                <TextInput
                  secureTextEntry
                  placeholder="Unesite admin šifru"
                  value={adminPassword}
                  onChangeText={setAdminPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity onPress={handleLogout} style={styles.confirmButton}>
                  <Text style={styles.confirmButtonText}>Potvrdi odjavu</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
        {/* Prikaz logout dugmeta samo ako je tab "notifikacije" aktivan */}
        {activeTab === 'notifikacije' && (
          <TouchableOpacity onPress={confirmLogout} style={styles.logoutButton}>
            <Text style={styles.logoutIcon}>🔓</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    zIndex:998, 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  closeButton: { padding: 15 },
  closeButtonText: { fontSize: 20, color: 'black', fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 10, marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  tabItem: { paddingVertical: 5, paddingHorizontal: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#007aff' },
  tabText: { fontSize: 16, color: '#444', fontWeight: '500' },
  activeTabText: { color: '#007aff', fontWeight: '700' },
  contentWrapper: { flex: 1, position: 'relative' },
  scrollContent: { flexGrow: 1, paddingBottom: 80 },
  content: { padding: 15 },
  label: { fontSize: 18, fontWeight: '500', color: '#929292', paddingBottom: 10 },
  picker: { backgroundColor: "white", elevation: 5, marginBottom: 25, fontSize: 16, minHeight: 30 },
  btn1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 35, marginBottom: 20, borderRadius: 30, paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, backgroundColor: 'green', borderColor: 'green' },
  btn2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderRadius: 30, paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, backgroundColor: 'red', borderColor: 'red' },
  btnText: { fontSize: 18, lineHeight: 26, fontWeight: '600', color: '#fff' },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
  logoutIcon: { fontSize: 20 },
  passwordContainer: { marginTop: 20, padding: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  passwordInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  confirmButton: { backgroundColor: '#007aff', padding: 10, borderRadius: 5, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontWeight: 'bold' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
});