import type { ConfigContext, ExpoConfig } from 'expo/config';

import identity from './src/config/app-identity.json';

const { name: APP_NAME, id: APP_ID, scheme: APP_SCHEME } = identity;

/**
 * App config. Name and bundle ID come from src/config/app-identity.json (the name may change after the
 * trademark check). Ad and purchase keys are added in Phase 6 through EAS env variables.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: 'gobblo',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: APP_SCHEME,
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: APP_ID,
    supportsTablet: true,
    icon: './assets/expo.icon',
    infoPlist: {
      NSFaceIDUsageDescription: 'Lock your bites with Face ID (optional, off by default).',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: APP_ID,
    adaptiveIcon: {
      backgroundColor: '#3D3BFF',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: true,
  },
  web: { output: 'single', favicon: './assets/images/favicon.png' },
  plugins: [
    'expo-router',
    ['expo-splash-screen', { backgroundColor: '#3D3BFF', image: './assets/images/splash-icon.png', imageWidth: 96, dark: { backgroundColor: '#0B0A1A' } }],
    'expo-audio',
    'expo-sharing',
    ['expo-local-authentication', { faceIDPermission: 'Lock your bites with Face ID (optional, off by default).' }],
    ['expo-notifications', { color: '#3D3BFF' }],
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
});
