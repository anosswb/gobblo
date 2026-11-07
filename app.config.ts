import type { ConfigContext, ExpoConfig } from 'expo/config';

import identity from './src/config/app-identity.json';

const { name: BASE_NAME, id: BASE_ID, scheme: BASE_SCHEME } = identity;

/**
 * APP_VARIANT=preview builds a fast release app that installs NEXT TO the dev client
 * (own package id + name), for testing real speed (120 Hz) on a phone.
 */
const preview = process.env.APP_VARIANT === 'preview';
/**
 * APP_FREE_SIGNING=1: install on an iPhone with a FREE Apple ID (Xcode "Personal Team", 7-day
 * apps). Free teams can't sign App Groups, so the widget + Live Activity extension is left out
 * and the bundle id is personal (APP_IOS_BUNDLE_ID, default app.gobblo.free).
 */
const freeSigning = process.env.APP_FREE_SIGNING === '1';
const APP_NAME = preview ? `${BASE_NAME} Preview` : BASE_NAME;
const APP_ID = preview ? `${BASE_ID}.preview` : BASE_ID;
const APP_SCHEME = preview ? `${BASE_SCHEME}-preview` : BASE_SCHEME;

/**
 * Dev builds compile native code for modern phones only (arm64): building all 4 ABIs ran the
 * free EAS worker out of memory. Preview/production builds keep every ABI for the stores.
 */
const buildArchs = process.env.APP_BUILD_ARCHS?.split(',').filter(Boolean);

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
    bundleIdentifier: freeSigning ? (process.env.APP_IOS_BUNDLE_ID ?? `${BASE_ID}.free`) : APP_ID,
    supportsTablet: true,
    icon: './assets/expo.icon',
    infoPlist: {
      NSFaceIDUsageDescription: 'Lock your bites with Face ID (optional, off by default).',
      ITSAppUsesNonExemptEncryption: false,
      // let Reanimated run at 120 Hz on ProMotion iPhones (Emil's animate-expo checklist)
      CADisableMinimumFrameDurationOnPhone: true,
    },
  },
  android: {
    package: APP_ID,
    adaptiveIcon: {
      backgroundColor: '#241A55',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: true,
    // Google's Auto Backup saves files/mmkv (all app data) to the user's Drive; restored on reinstall.
    // DECISIONS: phone backup in v1 instead of accounts (Anass, 2026-11-06)
    allowBackup: true,
  },
  web: { output: 'single', favicon: './assets/images/favicon.png' },
  plugins: [
    'expo-router',
    ['expo-splash-screen', { backgroundColor: '#F2F2F7', image: './assets/images/splash-icon.png', imageWidth: 120, dark: { backgroundColor: '#000000' } }],
    ['expo-build-properties', { android: buildArchs?.length ? { buildArchs } : {} }],
    './plugins/with-gradle-memory',
    // iOS widget + Live Activity (Start Kit). Left out for free-Apple-ID installs (no App Groups).
    // Android keeps react-native-android-widget.
    ...(freeSigning
      ? []
      : [
          [
            'expo-widgets',
            {
              widgets: [
                {
                  name: 'NextBite', // src/widgets/ios/next-bite-widget.tsx
                  displayName: `${APP_NAME}: next bite`,
                  description: 'Your next bite. With Start Kit, start 2 minutes in one tap.',
                  ios: {
                    supportedFamilies: ['systemSmall', 'systemMedium', 'accessoryRectangular', 'accessoryCircular'],
                    initialLayout: './src/widgets/ios/next-bite-widget.tsx',
                  },
                  android: null,
                },
              ],
            },
          ] as [string, object],
        ]),
    'expo-audio',
    [
      'react-native-android-widget',
      {
        widgets: [
          {
            name: 'NextBite', // src/widgets/next-bite-widget.tsx WIDGET_NAME
            label: `${APP_NAME}: next bite`,
            description: 'Your next bite. With Start Kit, start 2 minutes in one tap.',
            minWidth: '250dp',
            minHeight: '110dp',
            targetCellWidth: 4,
            targetCellHeight: 2,
            previewImage: './assets/images/icon.png',
            updatePeriodMillis: 1800000,
          },
        ],
      },
    ],
    'expo-sharing',
    ['expo-local-authentication', { faceIDPermission: 'Lock your bites with Face ID (optional, off by default).' }],
    [
      'expo-notifications',
      {
        color: '#3D3BFF',
        enableRemoteNotifications: false, // local notifications only (docs/05)
        sounds: ['./assets/sounds/boop.wav', './assets/sounds/chime.wav', './assets/sounds/pop.wav', './assets/sounds/loud.wav'],
      },
    ],
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  owner: 'anasswb',
  extra: { widgetsEnabled: !freeSigning, eas: { projectId: 'e33febe6-ba5a-4fb3-8373-657a861b19fc' } },
});
