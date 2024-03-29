import type { ExpoConfig } from '@expo/config';

const defineConfig = (): ExpoConfig => ({
  name: 'La Ruta',
  slug: 'la-ruta',
  scheme: 'la-ruta-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    backgroundColor: '#FCCB6F',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    config: {
      googleMapsApiKey: 'AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE',
    },
    supportsTablet: true,
    googleServicesFile: './GoogleService-Info.plist',
    bundleIdentifier: 'com.cubastore.laruta',
    entitlements: {
      'com.apple.developer.networking.wifi-info': true, // https://docs.expo.dev/versions/latest/sdk/netinfo/
    },
  },
  android: {
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FCCB6F',
    },
    config: {
      googleMaps: {
        apiKey: 'AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE',
      },
    },
    package: 'com.cubastore.laruta',
  },
  extra: {
    eas: {
      projectId: '6672061b-f930-433e-81a0-6ef06407692c',
    },
  },
  experiments: {
    tsconfigPaths: true,
  },
  plugins: ['@react-native-google-signin/google-signin', '@react-native-firebase/app'],
});

export default defineConfig;
