import { PlaceholderCard } from '@/components/placeholder-card';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { en } from '@/i18n/en';

export default function SpinScreen() {
  return (
    <Screen>
      <Text variant="title">{en.placeholder.spin}</Text>
      <PlaceholderCard title="the wheel" />
    </Screen>
  );
}
