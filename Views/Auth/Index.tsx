import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Header from '../Header';
import Register from './Register';
import Login from './Login';
import Confirmation from './Confirmation';
import RecoveryPassword from './RecoveryPassword';
import { View } from 'react-native';

const Stack = createNativeStackNavigator<any>();

const AuthPages: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Register">
      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          header: () => <Header />,
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          header: () => <Header />,
        }}
      />
      <Stack.Screen
        name="Confirmation"
        component={Confirmation}
        options={{
          header: () => <Header />,
        }}
      />
      <Stack.Screen
        name="recoveryPassword"
        component={RecoveryPassword}
        options={{
          header: () => <Header />,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthPages;
