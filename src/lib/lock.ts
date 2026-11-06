import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

/** Optional app lock (docs/12 #21). Everything stays on the phone; we never see biometrics. */
export async function canUseBiometrics(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
}

export async function unlock(reason = 'Unlock your bites'): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const r = await LocalAuthentication.authenticateAsync({ promptMessage: reason, cancelLabel: 'Not now' });
  return r.success;
}
