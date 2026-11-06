import { router } from 'expo-router';

/**
 * Go back, or go Home when there is nothing behind this screen (opened from a notification,
 * a deep link or a web reload). A bare router.back() there shows "GO_BACK was not handled".
 */
export function backOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
