import 'react-native-gesture-handler';
import '~/styles/global.css';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UserProvider } from '~/context/UserContext';
import { WSProvider } from '~/context/WSContext';

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

  useEffect(() => { }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <WSProvider>
      <UserProvider>
        <SafeAreaProvider onLayout={onLayoutRootView}>
          <StatusBar />
          <Stack
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="code" />
            <Stack.Screen name="sign" />
          </Stack>
        </SafeAreaProvider>
      </UserProvider>
    </WSProvider>
  );
};

export default RootLayout;
