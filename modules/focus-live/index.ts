import { requireOptionalNativeModule } from 'expo';

interface FocusLiveNative {
  isSupported(): boolean;
  showRunning(endsAt: number, title: string, text: string, uri: string): void;
  showStill(title: string, text: string, uri: string): void;
  hide(): void;
}

/** null on iOS / web / Expo Go (the iOS Live Activity comes with the EAS iOS build). */
const native = requireOptionalNativeModule<FocusLiveNative>('FocusLive');

export const focusLiveAvailable = native !== null;

export function showFocusRunning(endsAt: number, title: string, text: string, uri: string) {
  try {
    native?.showRunning(endsAt, title, text, uri);
  } catch {
    // never break focus over a notification
  }
}

export function showFocusStill(title: string, text: string, uri: string) {
  try {
    native?.showStill(title, text, uri);
  } catch {
    // never break focus over a notification
  }
}

export function hideFocus() {
  try {
    native?.hide();
  } catch {
    // ignore
  }
}
