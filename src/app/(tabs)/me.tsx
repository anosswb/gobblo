import { PlaceholderCard } from '@/components/placeholder-card';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import type { ThemePreference } from '@/state/schema';

export default function MeScreen() {
  const theme = useAppStore((s) => s.settings.theme);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <Screen>
      <Text variant="title">{en.placeholder.me}</Text>
      <Text variant="caption" tone="ink2">
        {en.settings.theme}
      </Text>
      <Segmented<ThemePreference>
        accessibilityLabel={en.settings.theme}
        value={theme}
        onChange={(v) => updateSettings({ theme: v })}
        options={[
          { value: 'system', label: en.settings.system },
          { value: 'light', label: en.settings.light },
          { value: 'dark', label: en.settings.dark },
        ]}
      />
      <PlaceholderCard title="stats + brain card + settings" />
    </Screen>
  );
}
