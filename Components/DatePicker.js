import React, { useState } from "react";
import { Platform, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function DatePickerComponent({ onDateChange }) {
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        console.log(event, selectedDate);
        if (selectedDate) {
            setDate(selectedDate);
            setShowPicker(false); // Zatvara picker nakon izbora datuma
            onDateChange(selectedDate);
        }
    };

    // ✅ Funkcija za formatiranje u "dd.mm.yy"
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(2); // Uzima samo zadnje dvije cifre godine
        return `${day}.${month}.${year}`;
    };

    return (
        <View>
            {Platform.OS === "web" ? (
                <View style={styles.container}>
                    <Text style={{ fontSize: 25 }}>📅</Text>
                    <input
                        type="date"
                        value={date.toISOString().split("T")[0]} // Prikazuje datum u input polju

                        onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            setDate(newDate);
                            onDateChange(newDate);
                        }}
                        style={styles.input}
                    />
                </View>
            ) : (
                <View style={styles.container}>
                    <Text style={{ fontSize: 25 }}>📅</Text>
                    <TouchableOpacity
                        onPress={() => setShowPicker(true)}
                        style={styles.touchable}
                    >
                        <Text style={styles.text}>{formatDate(date)}</Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 5,
        padding: 5,
        flexDirection: "row",
        justifyContent: "space-between"

    },
    input: {
        height: 30,
        fontSize: 16,
        padding: 10,
        borderRadius: 5,
        border: "1px solid gray",
        width: "100%",
        marginLeft: 5
    },
    touchable: {
        height: 45,
        width: "93%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
        backgroundColor: "#fff",
        marginLeft: 5,
    },
    text: {
        fontSize: 16,
    },
});
