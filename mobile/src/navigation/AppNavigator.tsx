import React, { useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { PermissionScreen } from '../screens/PermissionScreen';
import { PickAppsScreen } from '../screens/PickAppsScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { CreateContractScreen } from '../screens/CreateContractScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RootStackParamList } from './types';
import { useApp } from '../lib/app-context';
import type { AppStep } from '../types/domain';

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
  const initialStepRef = useRef<AppStep | null>(null);

  useEffect(() => {
    // 初回マウント時のstepを記録
    if (initialStepRef.current === null) {
      initialStepRef.current = step;
      return;
    }

    // stepが変わった場合のみ遷移
    if (step !== initialStepRef.current) {
      initialStepRef.current = step;
      const screenName = STEP_TO_SCREEN[step];
      navigation.reset({
        index: 0,
        routes: [{ name: screenName }],
      });
    }
  }, [step, navigation]);

  return null;
}

export function AppNavigator(): React.JSX.Element {
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
