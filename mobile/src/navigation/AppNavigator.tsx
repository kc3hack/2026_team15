import React, { useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { PermissionScreen } from '../screens/PermissionScreen';
import { PickAppsScreen } from '../screens/PickAppsScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { CreateContractScreen } from '../screens/CreateContractScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RootStackParamList } from './types';
import { useApp } from '../lib/app-context';
import type { AppStep } from '../types/domain';
import { colors } from '../lib/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const STEP_TO_SCREEN: Record<AppStep, keyof RootStackParamList> = {
  login: 'Login',
  permission: 'Permission',
  'pick-apps': 'PickApps',
  payment: 'Payment',
  'create-contract': 'CreateContract',
  dashboard: 'Dashboard',
};

function NavigationHandler() {
  const { step } = useApp();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const lastStepRef = useRef<AppStep | null>(null);

  useEffect(() => {
    // 初回マウント時も含め、現在のstepに同期する
    if (lastStepRef.current === step) return;
    lastStepRef.current = step;
    const screenName = STEP_TO_SCREEN[step];
    navigation.reset({
      index: 0,
      routes: [{ name: screenName }],
    });
  }, [step, navigation]);

  return null;
}

export function AppNavigator(): React.JSX.Element {
  const { isAuthInitializing } = useApp();

  if (isAuthInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <NavigationHandler />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Permission" component={PermissionScreen} />
        <Stack.Screen name="PickApps" component={PickAppsScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="CreateContract" component={CreateContractScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
