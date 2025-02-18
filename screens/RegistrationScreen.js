import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    SafeAreaView, StyleSheet, Text, View, ScrollView,
    Image, TouchableOpacity, TextInput, KeyboardAvoidingView,
    Platform
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { NetworkInfo } from 'react-native-network-info';

export default function RegistrationScreen({ navigation }) {
    const [form, setForm] = useState({
        ime: '',
        prezime: '',
    });
    const [wifiSSID, setWifiSSID] = useState(null);
    const [ipAddress, setIpAddress] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const user = await SecureStore.getItemAsync('user');
            if (user) {
                navigation.navigate('Main');
            }
        };
        const getWifi = async () => {
            NetworkInfo.getSSID().then(ssid => {
                setWifiSSID(ssid);
            });
        };
        getWifi();
        checkUser();
    }, []);

    const handleRegistration = async () => {
        const userData = {
            ime: form.ime,
            prezime: form.prezime,
            // ip: await getIpAddress(),
            vrijeme: new Date().toISOString(),
        };
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        // Pošalji podatke na backend
        // const response = await fetch('http://tvoj-server.com/register', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(userData),
        // });
        // if (response.ok) {
        //     navigation.navigate('Home');
        // }
        navigation.replace('Main');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    // contentContainerStyle={styles.container} 
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: 350, // Prilagodi prema visini tastature
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Image
                            alt='App Logo'
                            resizeMode='contain'
                            style={styles.headerImg}
                            source={require('./../assets/logo.png')}
                            accessibilityLabel="Logo aplikacije"
                        />
                        <Text style={styles.title}>
                            Dobrodošli u <Text style={{ color: 'red' }}>CA Log</Text>
                        </Text>
                        <Text style={styles.subtitle}>Wi-Fi mreža: {wifiSSID || 'Nije povezano na WiFi'}</Text>
                        <Text style={styles.subtitle}>
                            Da bi ste se registrovali na aplikaciju,
                            molimo, unesite Vaše ime i prezime
                        </Text>
                    </View>
                    <View style={styles.form}>
                        <View style={styles.input}>
                            {/* <Text style={styles.inputLabel}>Ime</Text> */}
                            <TextInput
                                autoCapitalize='words' // Prvo slovo veliko
                                autoCorrect={false}
                                clearButtonMode='while-editing'
                                keyboardType='default' // Postavi tipkovnicu
                                onChangeText={ime => setForm(prev => ({ ...prev, ime }))}
                                placeholder='Ime'
                                placeholderTextColor='gray'
                                style={styles.inputControl}
                                value={form.ime}
                            />
                        </View>
                        <View style={styles.input}>
                            {/* <Text style={styles.inputLabel}>Prezime</Text> */}
                            <TextInput
                                autoCapitalize='words' // Prvo slovo veliko
                                autoCorrect={false}
                                clearButtonMode='while-editing'
                                keyboardType='default' // Postavi tipkovnicu
                                onChangeText={prezime => setForm(prev => ({ ...prev, prezime }))}
                                placeholder='Prezime'
                                placeholderTextColor='gray'
                                style={styles.inputControl}
                                value={form.prezime}
                            />
                        </View>
                        <View style={styles.formAction}>
                            <TouchableOpacity
                                onPress={() => {
                                    console.warn('Sign in', form.ime, form.prezime);
                                    handleRegistration();
                                    // navigation.replace('Main');
                                }}
                                disabled={!form.ime.trim() || !form.prezime.trim()}
                                style={(!form.ime.trim() || !form.prezime.trim()) ?
                                    [{}, styles.btnDisabled] :
                                    [styles.btn]
                                }
                            >
                                <View>
                                    <Text style={(!form.ime.trim() || !form.prezime.trim()) ? styles.btnTextDisabled : styles.btnText}>Registruj</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'light'} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
    },
    title: {
        fontSize: 31,
        fontWeight: '700',
        color: '#1D2A32',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#929292',
    },
    // header
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 50,
    },
    headerImg: {
        width: '80%',
        height: 100,
        alignSelf: 'center',
        marginBottom: 36,
    },
    /** Form */
    form: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },
    formAction: {
        marginTop: 4,
        marginBottom: 16,
    },
    formLink: {
        fontSize: 16,
        fontWeight: '600',
        color: '#075eec',
        textAlign: 'center',
    },
    formFooter: {
        paddingVertical: 24,
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
        textAlign: 'center',
        letterSpacing: 0.15,
    },
    /** Input */
    input: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#222',
        marginBottom: 8,
    },
    inputControl: {
        height: 50,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
        borderWidth: 1,
        borderColor: '#C9D3DB',
        borderStyle: 'solid',
        elevation: 10,
        marginBottom: 8,
    },
    /** Button */
    btnDisabled: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        backgroundColor: '#ccc',
        borderColor: '#ccc',
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        backgroundColor: '#075eec',
        borderColor: '#075eec',
    },
    btnText: {
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '600',
        color: '#fff',
    },
    btnTextDisabled: {
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#ccc',
    },
});
