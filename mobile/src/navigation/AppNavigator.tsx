import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { PermissionScreen } from '../screens/PermissionScreen';
import { PickAppsScreen } from '../screens/PickAppsScreen';
import { CreateContractScreen } from '../screens/CreateContractScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerBackTitle: '戻る',
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'ログイン' }}
        />
        <Stack.Screen
          name="Permission"
          component={PermissionScreen}
          options={{ title: 'Screen Time 許可' }}
        />
        <Stack.Screen
          name="PickApps"
          component={PickAppsScreen}
          options={{ title: '制限アプリ選択' }}
        />
        <Stack.Screen
          name="CreateContract"
          component={CreateContractScreen}
          options={{ title: '契約作成' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Dashboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
