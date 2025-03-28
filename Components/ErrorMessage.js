import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ErrorMessage({ message, type = "error" }) {
    if (!message) return null; // Ako nema poruke, ne prikazuj ništa

    return (
        <View style={[styles.container, type === "success" ? styles.success : styles.error]}>
            <Text style={[styles.text, type === "success" ? styles.successText : styles.errorText]}>
                {type === "success" ? "✅ " : "⚠️ "} {message}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
    },
    error: {
        backgroundColor: '#ffcccc',
        borderColor: '#ff6666',
    },
    success: {
        backgroundColor: '#ccffcc',
        borderColor: '#66cc66',
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorText: {
        color: '#cc0000',
    },
    successText: {
        color: '#008000',
    },
});
