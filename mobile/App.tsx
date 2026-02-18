import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppProvider } from './src/lib/app-context';
import { AppNavigator } from './src/navigation/AppNavigator';

// TODO: Stripeアカウント作成後に実際の公開可能キーに置き換える
// テスト用キー例: pk_test_xxx
const STRIPE_PUBLISHABLE_KEY = '';

// Stripeを使用するかどうか（空文字の場合はモックモード）
const USE_STRIPE = STRIPE_PUBLISHABLE_KEY !== '';

function App(): React.JSX.Element {
  const appContent = (
    <AppProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AppProvider>
  );

  if (!USE_STRIPE) {
    // モックモード: StripeProviderなし
    return <SafeAreaProvider>{appContent}</SafeAreaProvider>;
  }

  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        {appContent}
      </StripeProvider>
    </SafeAreaProvider>
  );
}

export default App;
