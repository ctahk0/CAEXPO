import React from "react";
import { Image, StyleSheet } from "react-native";

const Logo = ({ style }) => {
    return (
        <Image
            alt="App Logo"
            resizeMode="contain"
            style={[styles.image, style]} 
            source={require("./../assets/logo.png")}
            accessibilityLabel="Logo aplikacije"
        />
    );
};

const styles = StyleSheet.create({
    image: {
        width: '80%', 
        height: 100,
        alignSelf: 'center',
        marginBottom: 50,
    },
});

export default Logo;
