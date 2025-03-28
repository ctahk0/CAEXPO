import React from 'react';
import { Text, View, Button } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Možeš ovdje logovati error (npr. u backend)
    console.log("📛 ErrorBoundary caught error:", error);
    console.log("📋 Info:", info);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red' }}>
            ⚠️ Došlo je do greške u prikazu.
          </Text>
          <Text style={{ marginVertical: 10 }}>{this.state.error?.toString()}</Text>
          <Button title="🔄 Pokušaj ponovo" onPress={this.resetError} />
        </View>
      );
    }

    return this.props.children;
  }
}
