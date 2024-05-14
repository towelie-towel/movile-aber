import 'react-native-gesture-handler';
import '~/styles/global.css';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-toast-notifications';

import { UserProvider } from '~/context/UserContext';

if (Platform.OS === 'android') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  NativeModules.UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    'Inter-Regular': require('../../assets/Inter-Regular.otf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <UserProvider>
      <ToastProvider>
        <SafeAreaProvider onLayout={onLayoutRootView}>
          <StatusBar />
          <Slot screenOptions={{
            headerShown: false,
          }} />
        </SafeAreaProvider>
      </ToastProvider>
    </UserProvider>
  );
};

export default RootLayout;
