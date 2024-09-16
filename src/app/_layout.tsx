import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '~/styles/global.css';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-toast-notifications';

import { MenuProvider } from '~/lib/react-native-popup-menu';
import { UserProvider, useUser } from '~/context/UserContext';
import { WSProvider } from '~/context/WSContext';
import { UserRole } from '~/types/User';

if (Platform.OS === 'android') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  NativeModules.UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync();

const getHomeRouteByRole = (userRole: UserRole) => {
  switch (userRole) {
    case "admin":
      return "(admin)/panel"
    case "client":
      return "(client)/index"
    case "taxi":
      return "(taxi)/taximap"
  }
}


const RootLayout = () => {
  const [userInitialized, setIsUserInitialized] = useState(false);
  const [isUserSigned, setIsUserSigned] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    'Inter-Regular': require('../../assets/Inter-Regular.otf'),
  });

  useEffect(() => {
    if (fontsLoaded && userInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, userInitialized]);

  return (
    <UserProvider>
      <WSWrapper setIsUserInitialized={setIsUserInitialized} setIsUserSigned={setIsUserSigned} setUserRole={setUserRole} >
        <ToastProvider>
          <MenuProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeAreaProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                  // ["(auth)/code", "(auth)/sign", "(client)/index", "(common)/chat", "(common)/profile", "(taxi)/taximap"]
                  initialRouteName={!isUserSigned ? "(auth)/sign" : getHomeRouteByRole(userRole ?? "client")}
                >
                  <Stack.Screen
                    name="(common)/profile/[id]"
                    options={{
                      presentation: 'modal',
                    }}
                  />
                </Stack>
              </SafeAreaProvider>
            </GestureHandlerRootView>
          </MenuProvider>
        </ToastProvider>
      </WSWrapper>
    </UserProvider>
  );
};

export default RootLayout;

const WSWrapper = ({ children, setIsUserInitialized, setIsUserSigned, setUserRole }: { children: React.ReactElement, setIsUserInitialized: React.Dispatch<React.SetStateAction<boolean>>, setIsUserSigned: React.Dispatch<React.SetStateAction<boolean>>, setUserRole: React.Dispatch<React.SetStateAction<UserRole | null>> }) => {
  const { profile, isInitializing, isSignedIn } = useUser();

  useEffect(() => {
    if (!isInitializing) {
      setIsUserSigned(isSignedIn)
      isSignedIn && setUserRole(profile?.role ?? null)
      setIsUserInitialized(true)
    }
  }, [isInitializing])

  if (isInitializing) return null

  return (
    <WSProvider userProfile={profile}>
      {children}
    </WSProvider>
  )
}