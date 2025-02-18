import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegistrationScreen from './screens/RegistrationScreen';
import MainScreen from './screens/MainScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Registration">
        <Stack.Screen name="Registration" component={RegistrationScreen} options={{ title: 'Registracija' }} />
        <Stack.Screen name="Main" component={MainScreen} options={{ title: 'Prijava/Odjava' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}