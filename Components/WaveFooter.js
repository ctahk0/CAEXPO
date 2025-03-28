import React from 'react';
import { Image, StyleSheet } from "react-native";

const WaveFooter = ({ style }) => {
    return (
        <Image
            alt="App Logo"
            resizeMode="cover"
            style={[styles.image, style]} 
            source={require("./../assets/footer.png")}
            accessibilityLabel="Footer aplikacije"
        />
    );
};

const styles = StyleSheet.create({
    image: {
        width: '100%', 
        height: 100,
    },
});
export default WaveFooter;
