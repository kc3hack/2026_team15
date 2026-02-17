import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/lib/app-context';
import { AppNavigator } from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
