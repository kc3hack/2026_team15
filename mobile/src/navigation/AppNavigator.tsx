import React from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const STEP_TO_SCREEN: Record<AppStep, keyof RootStackParamList> = {
  login: 'Login',
  permission: 'Permission',
  'pick-apps': 'PickApps',
  payment: 'Payment',
  'create-contract': 'CreateContract',
  dashboard: 'Dashboard',
};

export function AppNavigator(): React.JSX.Element {
  const { isAuthInitializing, step } = useApp();
  const isNavigationReadyRef = React.useRef(false);
  const syncRouteWithStep = React.useCallback(() => {
    if (isAuthInitializing) return;
    if (!isNavigationReadyRef.current || !navigationRef.isReady()) return;
    const screenName = STEP_TO_SCREEN[step];
    navigationRef.resetRoot({
      index: 0,
      routes: [{ name: screenName }],
    });
  }, [isAuthInitializing, step]);

  React.useEffect(() => {
    syncRouteWithStep();
  }, [syncRouteWithStep]);

  if (isAuthInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isNavigationReadyRef.current = true;
        syncRouteWithStep();
      }}
    >
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
