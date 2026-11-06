import { PlaceholderCard } from '@/components/placeholder-card';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { en } from '@/i18n/en';

export default function HomeScreen() {
  return (
    <Screen>
      <Text variant="title">{en.placeholder.home}</Text>
      <PlaceholderCard title="scene + pet + bites" />
    </Screen>
  );
}
