import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';


const API_URL = 'http://localhost:5000'; // Promeni na pravi backend URL

export default function MainScreen({ navigation }) {
    const [user, setUser] = useState(null);

    // Dohvati podatke o korisniku prilikom učitavanja komponente
    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await SecureStore.getItemAsync('user');
            if (userData) {
                setUser(JSON.parse(userData)); // Parsiraj podatke iz stringa u objekt
            }
        };
        fetchUserData();
    }, []);

    return (
        <View style={{ padding: 20 }}>
            {user ? (
                <Text style={{ fontSize: 20, marginBottom: 20 }}>
                    Dobrodošli, {user.ime} {user.prezime}!
                </Text>
            ) : (
                <Text style={{ fontSize: 20, marginBottom: 20 }}>
                    Dobrodošli!
                </Text>
            )}

            <Button title="Prijavi se na posao" onPress={() => Alert.alert('Prijava', 'Prijavljeni ste na posao.')} />
            <Button title="Odjavi se sa posla" onPress={() => Alert.alert('Odjava', 'Odjavljeni ste sa posla.')} />
            <Button title="Odjavi korisnika" color="red" />
        </View>
    );
}
