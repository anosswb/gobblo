import Constants from 'expo-constants';

/** false in free-Apple-ID builds (APP_FREE_SIGNING=1): no widget extension is installed. */
export const iosWidgetsEnabled = Constants.expoConfig?.extra?.widgetsEnabled !== false;
