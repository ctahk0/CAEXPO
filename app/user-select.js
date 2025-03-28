import React, { useState, useEffect, useRef } from "react";
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import NetInfo from "@react-native-community/netinfo";
import { getCurrentWifiSSID } from '../utils/wifi-check';
import axios from 'axios';
import { saveData, getData } from '../utils/storage';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import Logo from "../Components/Logo";
import WaveFooter from "../Components/WaveFooter";
import { EXPO_URL, EXPO_KEY } from '@env';
import Toast from 'react-native-toast-message';

export default function UserSelectScreen() {
    const router = useRouter();
    const API_URL = EXPO_URL;
    const API_KEY = EXPO_KEY;
    const scrollViewRef = useRef(null);

    const [izabranaPJ, setIzabranaPJ] = useState(null);
    const [izabraniRadnik, setIzabraniRadnik] = useState(null);
    const [ucitano, setUcitano] = useState(false);
    const [korisnici, setKorisnici] = useState([]);
    const [pjList, setPjList] = useState([]);
    const [filtriraniRadnici, setFiltriraniRadnici] = useState([]);
    const [wifiSSID, setWifiSSID] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const ssidRef = useRef(null);

    useEffect(() => {
        const fetchInitialSSID = async () => {
            const ssid = await getCurrentWifiSSID();
            ssidRef.current = ssid;
            setWifiSSID(ssid);
        };

        fetchInitialSSID();

        const unsubscribe = NetInfo.addEventListener((state) => {
            const ssid = state.type === 'wifi' ? state.details?.ssid || getCurrentWifiSSID() : null;
            if (ssid !== ssidRef.current) {
                ssidRef.current = ssid;
                setWifiSSID(ssid);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const initialize = async () => {
            try {
                const [savedPJ, savedRadnik] = await Promise.all([
                    getData("izabranaPJ"),
                    getData("izabraniRadnik"),
                ]);
                if (savedPJ && savedRadnik) {
                    setIzabranaPJ(savedPJ);
                    setIzabraniRadnik(savedRadnik);
                }

                const response = await axios.get(`${API_URL}/list`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY,
                    },
                });
                setKorisnici(response.data);
                const unikatnePJ = [...new Set(response.data.map(k => k.PJ))].sort((a, b) => a.localeCompare(b));
                setPjList(unikatnePJ);
            } catch (error) {
                Toast.show({ type: 'error', text1: 'Greška', text2: 'Neuspešno učitavanje podataka. Pokušajte ponovo.' });
            } finally {
                setUcitano(true);
            }
        };

        initialize();
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const userData = await getData('izabraniRadnik');
            if (userData && router) {
                router.replace('/main-screen');
            }
        };

        if (ucitano) {
            checkUser();
        }
    }, [ucitano, router]);

    useEffect(() => {
        if (izabranaPJ) {
            const filtrirani = korisnici.filter(k => k.PJ === izabranaPJ);
            setFiltriraniRadnici(filtrirani);
            scrollViewRef.current?.scrollTo({ y: 250, animated: true });
        } else {
            setFiltriraniRadnici([]);
        }
    }, [izabranaPJ, korisnici]);

    const sacuvajIzbor = async () => {
        if (!izabranaPJ || !izabraniRadnik) {
            Toast.show({ type: 'error', text1: 'Greška', text2: 'Molimo izaberite poslovnicu i radnika.' });
            return;
        }

        setIsLoading(true);
        try {
            await Promise.all([
                saveData("izabranaPJ", izabranaPJ),
                saveData("izabraniRadnik", izabraniRadnik),
            ]);
            await handleRegistration();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Greška', text2: `Neuspešno snimanje podataka: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegistration = async () => {
        const vrijeme = new Intl.DateTimeFormat('hr-HR', {
            timeZone: 'Europe/Sarajevo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(new Date());

        const userData = { PJ: izabranaPJ, Radnik: izabraniRadnik, vrijeme };

        try {
            const response = await axios.post(`${API_URL}/register`, userData, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
            });

            if (response.status === 200) {
                await saveData('pjList', JSON.stringify(pjList));
                Toast.show({ type: 'success', text1: 'Uspešno', text2: 'Izbor je sačuvan i registracija je uspešna!' });
                router.replace('/main-screen');
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Greška', text2: 'Neuspešna registracija. Pokušajte ponovo.' });
        }
    };

    if (!ucitano) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Učitavanje...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
                {/* <TouchableOpacity onPress={() => Updates.reloadAsync()} style={styles.reloadButton}>
                    <Text style={styles.reloadText}>🔄 Ponovo učitaj aplikaciju</Text>
                </TouchableOpacity> */}
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Logo />
                        <Text style={[styles.title, { lineHeight: 30, textAlign: 'center' }]}>
                            Dobrodošli u {"\n"}
                        </Text>
                        <Text style={[styles.title, { color: 'red' }]}>CA Radno Vrijeme</Text>
                        <Text style={{ marginBottom: 10 }}>📡 WiFi: {wifiSSID || "Nema wifi mreže"}</Text>
                        <Text style={styles.subtitle}>
                            Da biste se registrovali na aplikaciju, izaberite poslovnicu i radnika
                        </Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.labels}>Izaberite poslovnicu</Text>
                        <Picker
                            selectedValue={izabranaPJ}
                            onValueChange={setIzabranaPJ}
                            style={styles.picker}
                        >
                            <Picker.Item label="Poslovnica..." value="" />
                            {pjList.map((pj, index) => (
                                <Picker.Item key={index} label={pj} value={pj} />
                            ))}
                        </Picker>
                        {izabranaPJ && (
                            <>
                                <Text style={styles.labels}>Izaberite vaše ime</Text>
                                <Picker
                                    selectedValue={izabraniRadnik}
                                    onValueChange={setIzabraniRadnik}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Vaše ime i prezime..." value="" />
                                    {filtriraniRadnici.map((radnik, index) => (
                                        <Picker.Item key={index} label={radnik.Radnik} value={radnik.Radnik} />
                                    ))}
                                </Picker>
                            </>
                        )}
                        {izabraniRadnik && (
                            <TouchableOpacity style={styles.btn1} onPress={sacuvajIzbor} disabled={isLoading}>
                                <Text style={styles.btnText}>Sačuvaj izbor</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <WaveFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
    container: { flex: 1, justifyContent: "center", padding: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    scrollContent: { flexGrow: 1, paddingBottom: 300 },
    header: { alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
    content: { flex: 1 },
    title: { fontSize: 24, fontWeight: '700', color: '#1D2A32', marginBottom: 6 },
    subtitle: { fontSize: 15, fontWeight: '500', color: '#929292' },
    labels: { fontSize: 18, fontWeight: '500', color: '#929292', paddingBottom: 10 },
    picker: { backgroundColor: "white", elevation: 10, marginBottom: 35, fontSize: 16, minHeight: 35 },
    btn1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderRadius: 30, paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, backgroundColor: 'green', borderColor: 'green' },
    btnText: { fontSize: 18, lineHeight: 26, fontWeight: '600', color: '#fff' },
    reloadButton: { backgroundColor: 'red', padding: 10, borderRadius: 5, marginTop: 10, alignSelf: 'center' },
    reloadText: { color: 'white', fontWeight: 'bold' },
});