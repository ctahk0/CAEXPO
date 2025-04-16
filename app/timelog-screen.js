import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { EXPO_URL, EXPO_KEY } from '@env';
import { getData } from '../utils/storage';
import { useRouter } from 'expo-router';

// 🔹 Formatiranje vremena u hh:mm
const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return '-';
    const [hh, mm] = timeString.split(':');
    return `${hh}:${mm}`;
};

// 🔹 Formatiranje datuma u samo dan (dd)
const formatDay = (dateStr) => {
    try {
        const date = new Date(dateStr);
        return `${String(date.getDate()).padStart(2, '0')}`;
    } catch {
        return dateStr;
    }
};

const getDefaultMonth = () => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // format YYYY-MM
};

const TimeLogScreen = () => {
    const [logovi, setLogovi] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth());
    const router = useRouter();

    const API_URL = EXPO_URL;
    const API_KEY = EXPO_KEY;

    useEffect(() => {
        fetchLogovi(selectedMonth);
    }, [selectedMonth]);

    const fetchLogovi = async (month) => {
        setLoading(true);
        try {
            const radnik = await getData('izabraniRadnik');
            const response = await axios.get(`${API_URL}/logovi`, {
                params: { month, radnik },
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
            });
            setLogovi(response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Ako nema podataka
                setLogovi([]);
            } else {
                console.error("Greška pri dohvatanju logova:", error);
            }
        }
        setLoading(false);
    };


    const renderHeader = () => (
        <View style={styles.row}>
            <Text style={styles.headerCell}>Dan</Text>
            <Text style={styles.headerCell}>Prijava</Text>
            <Text style={styles.headerCell}>Odjava</Text>
            <Text style={styles.headerCell}>Radni sati</Text>
            <Text style={styles.headerCell}>Status</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{formatDay(item.datum)}</Text>
            <Text style={styles.cell}>{formatTime(item.prijava)}</Text>
            <Text style={styles.cell}>{formatTime(item.odjava)}</Text>
            <Text style={styles.cell}>{formatTime(item.radni_sati)}</Text>
            <Text style={styles.cell}>{item.status || '-'}</Text>
        </View>
    );

    const handleGoBack = () => {
        router.canGoBack() ? router.back() : router.replace('/user-select');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pregled radnih sati</Text>
                <TouchableOpacity
                    onPress={handleGoBack}
                    style={styles.closeButton}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.header}>

                <Picker
                    selectedValue={selectedMonth}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                >
                    {[...Array(3)].map((_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - i);
                        const value = date.toISOString().slice(0, 7);
                        return <Picker.Item key={value} label={value} value={value} />;
                    })}
                </Picker>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, backgroundColor: '#eee' }}>
                <Text style={{ flex: 1, fontWeight: 'bold' }}>Datum</Text>
                <Text style={{ flex: 1, fontWeight: 'bold' }}>Prijava</Text>
                <Text style={{ flex: 1, fontWeight: 'bold' }}>Odjava</Text>
                <Text style={{ flex: 1, fontWeight: 'bold' }}>Radni sati</Text>
                <Text style={{ flex: 1, fontWeight: 'bold' }}>Status</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : logovi.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>Nema podataka za izabrani mjesec.</Text>
            ) : (
                <FlatList
                    data={logovi}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.datum}-${index}`}
                />
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#f5f5f5"
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingTop: Platform.OS === 'ios' ? 50 : 10,
        zIndex: 998,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    picker: {
        flex: 1,
    },
    closeButton: { padding: 15 },
    closeButtonText: { fontSize: 20, color: 'black', fontWeight: 'bold' },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingVertical: 8,
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        color: '#333',
        fontSize: 14,
    },
    cell: {
        flex: 1,
        fontSize: 14,
        color: '#444',
    },
});

export default TimeLogScreen;
