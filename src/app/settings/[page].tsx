import { Redirect, useLocalSearchParams } from 'expo-router';

import { isPageId, SettingsPage } from '@/screens/settings/pages';

export default function SettingsPageRoute() {
  const { page } = useLocalSearchParams<{ page: string }>();
  if (!isPageId(page)) return <Redirect href="/settings" />;
  return <SettingsPage id={page} />;
}
